import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { ReplServerRouter } from './repl-server-router.js'
import { ReplServerError } from './repl-server.error.js'
import {
  NetReplServerConfig,
  NetReplServerOptions,
  REPL_SERVER,
  REPL_SERVER_BANNER_GREET,
  REPL_SERVER_BANNER_LEAVE,
  REPL_SERVER_ROUTER,
  ReplServer,
} from './repl-server.js'

/**
 * Net REPL server implementation
 *
 * @category none
 */
export class NetReplServer implements ReplServer {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new NetReplServer(
          c.resolve<Config<NetReplServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: NetReplServerOptions
  protected readonly server: net.Server

  protected readonly clients: Set<net.Socket> = new Set()

  constructor(
    config: Config<NetReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {
    this.options = this.buildOptions(config.data)

    this.server = net.createServer()

    this.server.on('connection', (socket) => {
      this.clients.add(socket)

      socket.on('close', () => {
        this.clients.delete(socket)
      })

      socket.on('timeout', () => {
        socket.destroy()
      })

      socket.on('error', (error) => {
        socket.destroy()

        this.logger.error(`ReplServer socket error`, {
          error: serializeError(error),
        })
      })

      socket.setTimeout(this.options.socketTimeout)

      this.handleConnection(socket).catch((error: unknown) => {
        this.logger.error(`ReplServer unexpected connection error`, {
          error: serializeError(error),
        })

        if (!socket.destroyed) {
          socket.destroy()
        }
      })
    })

    this.server.maxConnections = this.options.maxClients

    this.logger.debug(`ReplServer initialized`)
  }

  async start(): Promise<void> {
    await this.listen()

    this.logger.debug(`ReplServer started`)
  }

  async stop(): Promise<void> {
    await this.close()

    this.logger.debug(`ReplServer stopped`)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleConnection(socket: net.Socket): Promise<void> {
    try {
      this.replServerStart(socket)
    } catch (error) {
      this.logger.error(`ReplServer handle connection error`, {
        error: serializeError(error),
      })

      socket.end()
    }
  }

  private replServerStart(socket: net.Socket): repl.REPLServer {
    const bannerGreet = this.router.getAsset('banner-greet.txt') ?? REPL_SERVER_BANNER_GREET
    const bannerLeave = this.router.getAsset('banner-leave.txt') ?? REPL_SERVER_BANNER_LEAVE

    const replServer = repl.start({
      input: socket,
      output: socket,
      terminal: true,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: false,
      writer: (output) =>
        util.inspect(output, {
          depth: 4,
          colors: this.options.useColors,
        }),
    })

    replServer.on('reset', (context) => {
      this.defineContext(context)
    })

    replServer.on('exit', () => {
      socket.end(bannerLeave + '\n')
    })

    this.defineContext(replServer.context)
    this.defineCommands(replServer, socket)

    socket.write(bannerGreet + '\n')

    replServer.displayPrompt()

    return replServer
  }

  private defineContext(context: object) {
    const apiCalls: Record<string, unknown> = {}

    this.router.getApiCalls().forEach(([apiCallName, apiCall]) => {
      apiCalls[apiCallName] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          if (error instanceof ReplServerError) {
            error.context['apiCall'] = apiCallName
            error.context['data'] = data

            throw error
          } else {
            throw new ReplServerError(`Server internal error`, {
              cause: error,
              context: {
                apiCall: apiCallName,
                data,
              },
              code: 'INTERNAL_ERROR',
            })
          }
        }
      }
    })

    Object.defineProperty(context, 'famir', {
      value: apiCalls,
    })

    Object.defineProperty(context, 'getAssetNames', {
      value: (): string[] => {
        return this.router.getAssetNames()
      },
    })

    Object.defineProperty(context, 'getAsset', {
      value: (assetName: unknown): string | undefined => {
        if (!(assetName && typeof assetName === 'string')) {
          throw new TypeError(`Asset name not a string`)
        }

        return this.router.getAsset(assetName)
      },
    })
  }

  private defineCommands(replServer: repl.REPLServer, socket: net.Socket) {
    replServer.defineCommand('conns', {
      help: `Show connections`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Connections:\n\n`)

        this.clients.forEach((connection) => {
          const { remoteFamily, remoteAddress, remotePort } = connection

          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          socket.write(` - ${remoteFamily}:${remoteAddress}:${remotePort}\n`)
        })

        socket.write(`\n`)

        replServer.displayPrompt()
      },
    })
  }

  private listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.server.off('listening', listeningHandler)

        reject(error)
      }

      const listeningHandler = () => {
        this.server.off('error', errorHandler)

        resolve()
      }

      this.server.once('error', errorHandler)
      this.server.once('listening', listeningHandler)

      this.server.listen(this.options.port, this.options.address)
    })
  }

  private close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.server.off('close', closeHandler)

        reject(error)
      }

      const closeHandler = () => {
        this.server.off('error', errorHandler)

        resolve()
      }

      this.server.once('error', errorHandler)
      this.server.once('close', closeHandler)

      this.server.close()

      this.clients.forEach((socket) => {
        if (!socket.destroyed) {
          socket.end(`ReplServer stop\n`, () => {
            socket.destroy()
          })
        }
      })

      this.clients.clear()
    })
  }

  private buildOptions(config: NetReplServerConfig): NetReplServerOptions {
    return {
      address: config.REPL_SERVER_ADDRESS,
      port: config.REPL_SERVER_PORT,
      maxClients: config.REPL_SERVER_MAX_CLIENTS,
      socketTimeout: config.REPL_SERVER_SOCKET_TIMEOUT,
      prompt: config.REPL_SERVER_PROMPT,
      useColors: config.REPL_SERVER_USE_COLORS,
    }
  }
}
