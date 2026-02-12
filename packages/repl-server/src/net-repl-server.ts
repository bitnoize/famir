import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { ReplServerError } from './repl-server.error.js'
import {
  NetReplServerConfig,
  NetReplServerOptions,
  REPL_SERVER,
  ReplServer,
  replServerDict
} from './repl-server.js'

export class NetReplServer implements ReplServer {
  static inject(container: DIContainer) {
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
  protected readonly clients = new Set<net.Socket>()

  constructor(
    config: Config<NetReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {
    this.options = this.buildOptions(config.data)

    this.server = net.createServer((socket) => {
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
          error: serializeError(error)
        })
      })

      socket.setTimeout(this.options.socketTimeout)

      this.handleConnection(socket).catch((error: unknown) => {
        this.logger.error(`ReplServer connection unhandled error`, {
          error: serializeError(error)
        })
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
  protected async handleConnection(socket: net.Socket): Promise<void> {
    try {
      this.replServerStart(socket)
    } catch (error) {
      this.handleConnectionError(error, socket)
    }
  }

  protected handleConnectionError(error: unknown, socket: net.Socket) {
    socket.end()

    this.logger.error(`ReplServer connection failed`, {
      error: serializeError(error)
    })
  }

  protected replServerStart(socket: net.Socket): repl.REPLServer {
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
          colors: this.options.useColors
        })
    })

    replServer.on('reset', (context) => {
      this.defineContext(context)
    })

    replServer.on('exit', () => {
      socket.end(replServerDict.leave + '\n')
    })

    this.defineContext(replServer.context)

    socket.write(replServerDict.greet + '\n')

    replServer.displayPrompt()

    return replServer
  }

  protected defineContext(context: object) {
    const value: Record<string, unknown> = {}

    const apiCalls = this.router.resolve()

    apiCalls.forEach(([name, apiCall]) => {
      value[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          if (error instanceof ReplServerError) {
            error.context['apiCall'] = name
            error.context['data'] = data

            throw error
          } else {
            throw new ReplServerError(`Server unknown error`, {
              cause: error,
              context: {
                apiCall: name,
                data
              },
              code: 'INTERNAL_ERROR'
            })
          }
        }
      }
    })

    Object.defineProperty(context, 'famir', {
      configurable: false,
      enumerable: true,
      value: value
    })
  }

  protected listen(): Promise<void> {
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

  protected close(): Promise<void> {
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
      useColors: config.REPL_SERVER_USE_COLORS
    }
  }
}
