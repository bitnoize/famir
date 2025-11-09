import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  REPL_SERVER_REGISTRY,
  ReplServer,
  ReplServerApiCalls,
  ReplServerRegistry
} from '@famir/domain'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { ReplServerConfig, ReplServerOptions } from './repl-server.js'
import { buildOptions } from './repl-server.utils.js'

export class NodeReplServer implements ReplServer {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new NodeReplServer(
          c.resolve<Config<ReplServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY)
        )
    )
  }

  protected readonly options: ReplServerOptions
  protected readonly server: net.Server
  protected readonly clients = new Set<net.Socket>()

  constructor(
    config: Config<ReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly registry: ReplServerRegistry
  ) {
    this.options = buildOptions(config.data)

    this.server = net.createServer()

    this.server.on('connection', (socket) => {
      this.logger.debug(`Server connection event`, {
        socket: socket.address()
      })

      this.handleServerConnection(socket)
    })

    this.server.on('drop', (data) => {
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

    this.server.maxConnections = this.options.maxClients

    this.logger.debug(`ReplServer initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  listen(): Promise<void> {
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

      this.logger.debug(`ReplServer listening`)
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

      this.logger.info(`ReplServer closed`)
    })
  }

  protected handleServerConnection(socket: net.Socket) {
    this.clients.add(socket)

    socket.setTimeout(this.options.socketTimeout)

    socket.on('close', (hadError) => {
      this.logger.debug(`Socket close event`, {
        socket: socket.address(),
        hadError
      })

      this.clients.delete(socket)
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
      this.defineReplContext(replServer)
    })

    replServer.on('exit', () => {
      socket.end(`So long!\n`)
    })

    this.defineReplCommands(replServer, socket)

    socket.write(`Welcome to Fake-Mirrors REPL!\n`)

    replServer.displayPrompt()
  }

  protected defineReplContext(replServer: repl.REPLServer) {
    const value: ReplServerApiCalls = {}

    const apiCalls = this.registry.getApiCalls()

    Object.entries(apiCalls).forEach(([name, apiCall]) => {
      value[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          this.logger.error(`ReplServer ApiCall error`, {
            error: serializeError(error)
          })

          throw error
        }
      }
    })

    Object.defineProperty(replServer.context, 'famir', {
      configurable: false,
      enumerable: true,
      value
    })
  }

  protected defineReplCommands(replServer: repl.REPLServer, socket: net.Socket) {
    replServer.defineCommand('cons', {
      help: `Show active connections`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Active connections:\n\n`)

        this.clients.forEach((connection) => {
          const { remoteFamily, remoteAddress, remotePort } = connection

          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          socket.write(` - ${remoteFamily}:${remoteAddress}:${remotePort}\n`)
        })

        socket.write(`\n`)

        replServer.displayPrompt()
      }
    })

    replServer.defineCommand('.calls', {
      help: `Show Api calls`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Api calls:\n\n`)

        socket.write(
          util.inspect(this.registry.getApiNames(), {
            colors: this.options.useColors
          })
        )

        socket.write(`\n`)

        replServer.displayPrompt()
      }
    })
  }
}
