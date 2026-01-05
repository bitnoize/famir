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
      this.handleServerConnection(socket)
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

  protected handleServerConnection(socket: net.Socket) {
    this.clients.add(socket)

    socket.setTimeout(this.options.socketTimeout)

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
      this.defineReplContext(replServer)
    })

    replServer.on('exit', () => {
      socket.end(`So long!\n`)
    })

    this.defineReplContext(replServer)

    this.defineReplCommands(replServer, socket)

    socket.write(`Welcome to Fake-Mirrors REPL!\n`)

    replServer.displayPrompt()
  }

  protected defineReplContext(replServer: repl.REPLServer) {
    Object.defineProperty(replServer.context, 'famir', {
      configurable: false,
      enumerable: true,
      value: this.router.resolve()
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

    replServer.defineCommand('apiCalls', {
      help: `Show Api calls`,
      action: () => {
        replServer.clearBufferedCommand()

        socket.write(`Api calls:\n\n`)

        //socket.write(
        //  util.inspect(this.router.getApiNames(), {
        //    colors: this.options.useColors
        //  })
        //)

        socket.write(`\n`)

        replServer.displayPrompt()
      }
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

/*

    const api = this.router.resolve((name, apiCall, data) => {
      try {
        return await apiCall(data)
      } catch (error) {
        const raiseError = this.raiseApiCallError(error, name, data)

        this.logger.error(`ReplServer apiCall error`, {
          error: serializeError(raiseError)
        })

        throw raiseError
      }
    })



    const value: ReplServerApiCalls = {}

    const apiCalls = this.router.getApiCalls()

    Object.entries(apiCalls).forEach(([name, apiCall]) => {
      value[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          const raiseError = this.raiseApiCallError(error, name, data)

          this.logger.error(`ReplServer apiCall error`, {
            error: serializeError(raiseError)
          })

          throw raiseError
        }
      }
    })



  protected raiseApiCallError(error: unknown, apiCall: string, data: unknown): ReplServerError {
    if (error instanceof ReplServerError) {
      error.context['apiCall'] = apiCall
      error.context['data'] = data

      return error
    } else {
      return new ReplServerError(`Server unknown error`, {
        cause: error,
        context: {
          apiCall,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }


*/
