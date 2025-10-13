import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  REPL_SERVER_CONTEXT,
  ReplServer,
  ReplServerContext
} from '@famir/domain'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { ReplServerConfig, ReplServerOptions } from './repl-server.js'
import { buildOptions } from './repl-server.utils.js'

export class NetReplServer implements ReplServer {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new NetReplServer(
          c.resolve<Config<ReplServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT)
        )
    )
  }

  protected readonly options: ReplServerOptions
  private readonly _server: net.Server
  private readonly _connections = new Set<net.Socket>()

  constructor(
    config: Config<ReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly context: ReplServerContext
  ) {
    this.options = buildOptions(config.data)

    this._server = net.createServer(this.connectionHandler)

    this._server.on('connection', (socket) => {
      this.logger.debug(`Server connect event`, {
        socket: socket.address()
      })
    })

    this._server.on('drop', (data) => {
      this.logger.debug(`Server drop event`, {
        socket:
          data !== undefined
            ? {
                family: data.remoteFamily,
                address: data.remoteAddress,
                port: data.remotePort
              }
            : null
      })
    })

    this._server.maxConnections = this.options.maxConnections

    this.logger.debug(`ReplServer initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  protected connectionHandler = (socket: net.Socket) => {
    this._connections.add(socket)

    socket.setTimeout(this.options.socketTimeout)

    socket.on('close', (hadError) => {
      this.logger.debug(`Socket close event`, {
        socket: socket.address(),
        hadError
      })

      this._connections.delete(socket)
    })

    socket.on('error', (error) => {
      this.logger.error(`Socket error event`, {
        socket: socket.address(),
        error: serializeError(error)
      })

      socket.destroy()
    })

    socket.on('timeout', () => {
      this.logger.debug(`Socket timeout event`, {
        socket: socket.address()
      })

      socket.destroy()
    })

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
          depth: null,
          colors: this.options.useColors
        })
    })

    replServer.on('reset', () => {
      this.context.applyTo(replServer)
    })

    replServer.on('exit', () => {
      socket.write(`So long!\n`)

      socket.end()
    })

    this.context.applyTo(replServer)

    this.defineCommands(socket, replServer)

    socket.write(`Welcome to Fake-Mirrors REPL!\n`)

    replServer.displayPrompt()
  }

  protected defineCommands(socket: net.Socket, replServer: repl.REPLServer) {
    replServer.defineCommand('cons', {
      help: `Show active connections`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Active connections:\n\n`)

        this._connections.forEach((connection) => {
          const { remoteFamily, remoteAddress, remotePort } = connection

          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          socket.write(` - ${remoteFamily}:${remoteAddress}:${remotePort}\n`)
        })

        socket.write(`\n`)

        replServer.displayPrompt()
      }
    })

    replServer.defineCommand('dump', {
      help: `Show context dump`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Context dump:\n\n`)

        socket.write(
          util.inspect(this.context.dump(), {
            colors: this.options.useColors
          })
        )

        socket.write(`\n`)

        replServer.displayPrompt()
      }
    })
  }

  async listen(): Promise<void> {
    await this._listen()

    this.logger.debug(`ReplServer listening`)
  }

  async close(): Promise<void> {
    await this._close()

    this.logger.info(`ReplServer closed`)
  }

  private _listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this._server.off('listening', listeningHandler)

        reject(error)
      }

      const listeningHandler = () => {
        this._server.off('error', errorHandler)

        resolve()
      }

      this._server.once('error', errorHandler)
      this._server.once('listening', listeningHandler)

      this._server.listen(this.options.port, this.options.address)
    })
  }

  private _close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this._server.off('close', closeHandler)

        reject(error)
      }

      const closeHandler = () => {
        this._server.off('error', errorHandler)

        resolve()
      }

      this._server.once('error', errorHandler)
      this._server.once('close', closeHandler)

      this._server.close()

      this._connections.forEach((socket) => {
        if (!socket.destroyed) {
          socket.end(`ReplServer stop\n`, () => {
            socket.destroy()
          })
        }
      })

      this._connections.clear()
    })
  }
}
