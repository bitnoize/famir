import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  REPL_SERVER_ROUTER,
  ReplServer,
  ReplServerRouter
} from '@famir/domain'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { ReplServerConfig, ReplServerOptions } from './repl-server.js'

export class NodeReplServer implements ReplServer {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new NodeReplServer(
          c.resolve<Config<ReplServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: ReplServerOptions
  protected readonly server: net.Server
  protected readonly clients = new Set<net.Socket>()

  constructor(
    config: Config<ReplServerConfig>,
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

      this.handleConnection(socket)
    })

    this.server.maxConnections = this.options.maxClients

    this.logger.debug(`ReplServer initialized`)
  }

  listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.server.off('listening', listeningHandler)

        reject(error)
      }

      const listeningHandler = () => {
        this.server.off('error', errorHandler)

        this.logger.debug(`ReplServer listening`)

        resolve()
      }

      this.server.once('error', errorHandler)
      this.server.once('listening', listeningHandler)

      this.server.listen(this.options.port, this.options.address)
    })
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.server.off('close', closeHandler)

        reject(error)
      }

      const closeHandler = () => {
        this.server.off('error', errorHandler)

        this.logger.info(`ReplServer closed`)

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

  protected handleConnection(socket: net.Socket) {
    try {
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

      replServer.on('reset', () => {
        this.defineContext(replServer)
      })

      replServer.on('exit', () => {
        socket.end(`So long!\n`)
      })

      this.defineContext(replServer)

      socket.write(`Welcome to Fake-Mirrors REPL!\n`)

      replServer.displayPrompt()
    } catch (error) {
      this.handleError(error, socket)
    }
  }

  protected handleError(error: unknown, socket: net.Socket) {
    socket.end()

    this.logger.error(`ReplServer connection failed`, {
      error: serializeError(error)
    })
  }

  protected defineContext(replServer: repl.REPLServer) {
    Object.defineProperty(replServer.context, 'famir', {
      configurable: false,
      enumerable: true,
      value: this.router.resolve()
    })
  }

  private buildOptions(config: ReplServerConfig): ReplServerOptions {
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
