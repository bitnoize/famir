import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Console } from 'node:console'
import net from 'node:net'
import repl from 'node:repl'
import type { Readable, Writable } from 'node:stream'
import { BaseReplServer } from './base-repl-server.js'
import { REPL_SERVER_ASSETS, ReplServerAssets } from './repl-server-assets.js'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { NetReplServerConfig, REPL_SERVER, ReplServer } from './repl-server.js'
import { netReplServerConfigSchema } from './repl-server.schemas.js'

/**
 * Options for a Net repl-server.
 */
interface NetReplServerOptions {
  address: string
  port: number
  maxClients: number
  socketTimeout: number
  prompt: string
  useColors: boolean
}

/**
 * Net-based repl-server implementation.
 *
 * This server runs a REPL (Read-Eval-Print-Loop) over TCP network connections.
 * It allows remote administration and debugging via telnet or netcat clients.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link ReplServerAssets} via {@link REPL_SERVER_ASSETS} token
 * - {@link ReplServerRouter} via {@link REPL_SERVER_ROUTER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER, ReplServer, NetReplServer } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * NetReplServer.register(container)
 *
 * // Resolve from DI container
 * const replServer = container.resolve<ReplServer>(REPL_SERVER)
 *
 * // Start REPL server
 * await replServer.start()
 *
 * //  Stop server
 * await replServer.stop()
 * ```
 */
export class NetReplServer extends BaseReplServer implements ReplServer {
  /**
   * Registers the repl-server as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new NetReplServer(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
        )
    )
  }

  /** Built server options. */
  protected readonly options: NetReplServerOptions

  /** Underlying Node.js Net server instance. */
  protected readonly server: net.Server

  /** Set of active client socket connections. */
  protected readonly clients: Set<net.Socket> = new Set()

  /**
   * Creates a new repl-server instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   */
  constructor(
    validator: Validator,
    config: Config,
    logger: Logger,
    assets: ReplServerAssets,
    router: ReplServerRouter
  ) {
    super(validator, config, logger, assets, router)

    this.validator.addSchema('repl-server-config', netReplServerConfigSchema)

    const configData = this.config.get<NetReplServerConfig>('repl-server-config')
    this.options = this.buildOptions(configData)

    this.server = net.createServer()

    this.server.on('listening', () => {
      this.logger.info(`ReplServer server event: listening`)
    })

    this.server.on('connection', (socket) => {
      this.clients.add(socket)

      socket.on('close', () => {
        this.clients.delete(socket)
      })

      socket.on('timeout', () => {
        socket.destroy()
      })

      socket.on('error', (error) => {
        this.logger.error(`ReplServer socket event: error`, {
          error: serializeError(error),
        })

        socket.destroy()
      })

      socket.setTimeout(this.options.socketTimeout)

      this.handleConnection(socket)
    })

    this.server.on('close', () => {
      this.logger.info(`ReplServer server event: close`)
    })

    this.server.maxConnections = this.options.maxClients
  }

  #isRunning: boolean = false

  async start(): Promise<void> {
    try {
      if (!this.#isRunning) {
        this.#isRunning = true

        await this.listen()

        this.logger.debug(`ReplServer started and listening`)
      } else {
        this.logger.debug(`ReplServer already listening`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'start')
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.#isRunning) {
        this.#isRunning = false

        await this.close()

        this.logger.debug(`ReplServer stopped and closed all connections`)
      } else {
        this.logger.debug(`ReplServer already closed`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'stop')
    }
  }

  /**
   * Handles an incoming TCP connection.
   *
   * @param socket - The client socket connection.
   */
  protected handleConnection(socket: net.Socket) {
    try {
      const console = this.initConsole(socket, socket)

      const rs = this.initReplServer(socket, socket)

      rs.on('reset', (context) => {
        this.defineContext(context)
      })

      rs.on('exit', () => {
        console.log(this.getBannerLeave())
      })

      this.defineContext(rs.context)

      this.defineCommands(console, rs)

      console.log(this.getBannerGreet())

      rs.displayPrompt()
    } catch (error) {
      this.logger.error(`ReplServer handle connection error`, {
        error: serializeError(error),
      })

      if (!socket.writableEnded) {
        socket.end()
      }
    }
  }

  protected initConsole(stdout: Writable, stderr: Writable): Console {
    return new Console({
      stdout,
      stderr,
      colorMode: this.options.useColors,
      inspectOptions: { depth: 8 },
    })
  }

  protected initReplServer(input: Readable, output: Writable): repl.REPLServer {
    return repl.start({
      input,
      output,
      terminal: false,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: false,
    })
  }

  /**
   * Starts listening on the configured address and port.
   *
   * @returns A promise that resolves when the server is listening.
   */
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

  /**
   * Closes the server and all client connections.
   *
   * @returns A promise that resolves when the server is closed.
   */
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

  /**
   * Converts validated configuration to a repl-server options.
   *
   * @param data - The validated configuration object.
   * @returns The repl-server options object.
   */
  private buildOptions(data: NetReplServerConfig): NetReplServerOptions {
    return {
      address: data.REPL_SERVER_ADDRESS,
      port: data.REPL_SERVER_PORT,
      maxClients: data.REPL_SERVER_MAX_CLIENTS,
      socketTimeout: data.REPL_SERVER_SOCKET_TIMEOUT,
      prompt: data.REPL_SERVER_PROMPT,
      useColors: data.REPL_SERVER_USE_COLORS,
    }
  }
}
