import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import net from 'node:net'
import repl from 'node:repl'
import util from 'node:util'
import { Context, ReplServer, ReplServerConfig, ReplServerOptions } from './repl-server.js'
import { replServerSchemas } from './repl-server.schemas.js'
import { buildOptions } from './repl-server.utils.js'

export class NodeReplServer implements ReplServer {
  protected readonly options: ReplServerOptions
  private readonly _server: net.Server
  private readonly _connections = new Set<net.Socket>()

  constructor(
    validator: Validator,
    config: Config<ReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly context: Context
  ) {
    validator.addSchemas(replServerSchemas)

    this.options = buildOptions(config.data)

    this._server = net.createServer(this.connectionHandler)

    this._server.on('connection', (socket) => {
      this.logger.debug(
        {
          socket: socket.address()
        },
        `Server connect event`
      )
    })

    this._server.on('drop', (data) => {
      this.logger.debug(
        {
          socket:
            data !== undefined
              ? {
                  family: data.remoteFamily,
                  address: data.remoteAddress,
                  port: data.remotePort
                }
              : null
        },
        `Server drop event`
      )
    })

    this._server.maxConnections = this.options.maxConnections
  }

  protected connectionHandler = (socket: net.Socket) => {
    this._connections.add(socket)

    socket.setTimeout(this.options.socketTimeout)

    socket.on('close', (hadError) => {
      this.logger.debug(
        {
          socket: socket.address(),
          hadError
        },
        `Socket close event`
      )

      this._connections.delete(socket)
    })

    socket.on('error', (error) => {
      this.logger.error(
        {
          socket: socket.address(),
          error: serializeError(error)
        },
        `Socket error event`
      )

      socket.destroy()
    })

    socket.on('timeout', () => {
      this.logger.debug(
        {
          socket: socket.address()
        },
        `Socket timeout event`
      )

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

  async start(): Promise<void> {
    new Promise<void>((resolve, reject) => {
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

    this.logger.debug(
      {
        options: {
          address: this.options.address,
          port: this.options.port,
          maxConnections: this.options.maxConnections,
          socketTimeout: this.options.socketTimeout
        }
      },
      `ReplServer started`
    )
  }

  async stop(): Promise<void> {
    new Promise<void>((resolve, reject) => {
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

    this.logger.debug({}, `ReplServer stopped`)
  }
}
