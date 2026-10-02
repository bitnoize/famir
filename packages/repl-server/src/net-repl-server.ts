import { DIContainer, LifecycleError, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  ReplServer,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { Console } from 'node:console'
import net from 'node:net'
import type { Readable, Writable } from 'node:stream'
import * as readline from 'readline'
import { BaseReplServer } from './base-repl-server.js'
import { REPL_SERVER_ASSETS, ReplServerAssets } from './repl-server-assets.js'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { NetReplServerConfig, REPL_SERVER_PROMPT } from './repl-server.js'
import { netReplServerConfigSchema } from './repl-server.schemas.js'

/**
 * Options for a Net repl-server.
 */
interface NetReplServerOptions {
  address: string
  port: number
  maxClients: number
  socketTimeout: number
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
 * import { NetReplServer } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * NetReplServer.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER, ReplServer } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
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

  /** Start in-flight promise. */
  private startPromise: Promise<void> | null = null

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

    const conf = this.config.get<NetReplServerConfig>('repl-server-config')
    this.options = this.buildOptions(conf)

    this.server = net.createServer()

    this.server.on('listening', () => {
      this.logger.debug(`ReplServer server event: listening`)
    })

    this.server.on('connection', (socket) => {
      this.clients.add(socket)

      socket.on('close', () => {
        this.clients.delete(socket)
      })

      socket.on('timeout', () => {
        socket.destroy()
      })

      //socket.on('error', () => {
      //  socket.destroy()
      //})

      socket.setTimeout(this.options.socketTimeout)

      this.handleConnection(socket)
    })

    this.server.on('close', () => {
      this.logger.debug(`ReplServer server event: close`)
    })

    this.server.maxConnections = this.options.maxClients
  }

  #isShutdown: boolean = false

  #isRunning: boolean = false

  async start(): Promise<void> {
    if (this.#isShutdown) {
      this.logger.debug(`ReplServer shutdown, skip start`)

      return
    }

    if (this.startPromise) {
      return this.startPromise
    }

    this.startPromise = this.performStart()

    return this.startPromise
  }

  async stop(): Promise<void> {
    try {
      this.#isShutdown = true

      if (this.startPromise) {
        try {
          await this.startPromise
        } catch {
          // Ignore start error
        }
      }

      if (this.#isRunning) {
        await this.waitUntilServerClose()

        this.#isRunning = false

        this.logger.info(`ReplServer stopped and closed all connections`)
      } else {
        this.logger.debug(`ReplServer not running, skip stop`)
      }
    } catch (error) {
      this.#isRunning = false

      throw LifecycleError.wrap(error, {
        service: 'repl-server',
        method: 'stop',
      })
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

      const rl = this.initReadline(socket, socket)

      this.setupReadline(console, rl)

      rl.prompt()
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
      inspectOptions: {
        showHidden: false,
        depth: null,
      },
    })
  }

  protected initReadline(input: Readable, output: Writable): readline.Interface {
    return readline.createInterface({
      input,
      output,
      terminal: false,
      prompt: REPL_SERVER_PROMPT,
    })
  }

  /**
   * Actual start logic.
   */
  private async performStart(): Promise<void> {
    try {
      if (!this.#isRunning) {
        await this.waitUntilServerListening()

        this.#isRunning = true

        this.logger.info(`ReplServer started and listening`)
      } else {
        this.logger.debug(`ReplServer already running, skip start`)
      }
    } catch (error) {
      this.#isRunning = false

      throw LifecycleError.wrap(error, {
        service: 'repl-server',
        method: 'start',
      })
    } finally {
      this.startPromise = null
    }
  }

  /**
   * Starts the Net server and listen connections.
   */
  private waitUntilServerListening(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        this.server.off('listening', onListening)
        this.server.off('error', onError)
      }

      const onListening = () => {
        if (settled) return
        settled = true

        cleanup()
        resolve()
      }

      const onError = (error: Error) => {
        if (settled) return
        settled = true

        cleanup()
        reject(LifecycleError.create(`Server listen failed`, null, error))
      }

      this.server.once('listening', onListening)
      this.server.once('error', onError)

      try {
        this.server.listen(this.options.port, this.options.address)
      } catch (error) {
        cleanup()
        reject(LifecycleError.create(`Server listen critical error`, null, error))
      }
    })
  }

  /**
   * Closes the Net server and all connections.
   */
  private waitUntilServerClose(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        this.server.off('close', onClose)
        this.server.off('error', onError)
      }

      const onClose = () => {
        if (settled) return
        settled = true

        cleanup()
        resolve()
      }

      const onError = (error: Error) => {
        if (settled) return
        settled = true

        cleanup()
        reject(LifecycleError.create(`Server close failed`, null, error))
      }

      this.server.once('close', onClose)
      this.server.once('error', onError)

      try {
        this.server.close()

        this.clients.forEach((socket) => {
          if (!socket.destroyed) {
            socket.end(`ReplServer stop\n`, () => {
              socket.destroy()
            })
          }
        })

        this.clients.clear()
      } catch (error) {
        cleanup()
        reject(LifecycleError.create(`Server close critical error`, null, error))
      }
    })
  }

  /**
   * Converts validated configuration to a repl-server options.
   */
  private buildOptions(conf: NetReplServerConfig): NetReplServerOptions {
    return {
      address: conf.REPL_SERVER_ADDRESS,
      port: conf.REPL_SERVER_PORT,
      maxClients: conf.REPL_SERVER_MAX_CLIENTS,
      socketTimeout: conf.REPL_SERVER_SOCKET_TIMEOUT,
      useColors: conf.REPL_SERVER_USE_COLORS,
    }
  }
}
