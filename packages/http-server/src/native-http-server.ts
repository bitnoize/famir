import { DIContainer, LifecycleError, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import http from 'node:http'
import WebSocket, { WebSocketServer } from 'ws'
import {
  HTTP_SERVER_CONTEXT_FACTORY,
  HttpServerContextFactory,
} from './http-server-context-factory.js'
import { HttpServerContext } from './http-server-context.js'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from './http-server-router.js'
import { HttpServerError } from './http-server.error.js'
import {
  HTTP_SERVER,
  HTTP_SERVER_DEFAULT_ERROR_PAGE,
  HttpServer,
  HttpServerSettings,
  NativeHttpServerConfig,
} from './http-server.js'
import { nativeHttpServerConfigSchema } from './http-server.schemas.js'

/**
 * Options for a Native http-server.
 */
interface NativeHttpServerOptions extends HttpServerSettings {
  address: string
  port: number
  verbose: boolean
}

/**
 * Native-based http-server implementation.
 *
 * This server uses native Node.js `http` and WebSocket `ws` modules to handle
 * HTTP requests and WebSocket connections.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link Templater} via {@link TEMPLATER} token
 * - {@link HttpServerRouter} via {@link HTTP_SERVER_ROUTER} token
 * - {@link HttpServerContextFactory} via {@link HTTP_SERVER_CONTEXT_FACTORY} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HTTP_SERVER, HttpServer, NativeHttpServer } from '@famir/http-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * NativeHttpServer.register(container)
 *
 * // Resolve from DI container
 * const httpServer = container.resolve<HttpServer>(HTTP_SERVER)
 *
 * // Start HTTP and WebSocket server
 * await httpServer.start()
 *
 * //  Stop server
 * await httpServer.stop()
 * ```
 */
export class NativeHttpServer implements HttpServer {
  /**
   * Registers the http-server as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer, settings?: Partial<HttpServerSettings>) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new NativeHttpServer(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<HttpServerContextFactory>(HTTP_SERVER_CONTEXT_FACTORY),
          settings
        )
    )
  }

  /** Built http-server options. */
  protected readonly options: NativeHttpServerOptions

  /** Underlying HTTP server instance. */
  protected readonly server: http.Server

  /** Underlying WebSocket server instance. */
  protected readonly wss: WebSocketServer

  /** Start in-flight promise. */
  private startPromise: Promise<void> | null = null

  /**
   * Creates a new http-server instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param router - The router instance.
   * @param contextFactory - The context factory instance.
   * @param settings - The settings object.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly router: HttpServerRouter,
    protected readonly contextFactory: HttpServerContextFactory,
    settings: Partial<HttpServerSettings> = {}
  ) {
    this.validator.addSchema('http-server-config', nativeHttpServerConfigSchema)

    const conf = this.config.get<NativeHttpServerConfig>('http-server-config')
    this.options = this.buildOptions(conf, settings)

    this.server = http.createServer()

    this.wss = new WebSocketServer({
      server: this.server,
      clientTracking: true,
      autoPong: true,
    })

    this.server.on('listening', () => {
      this.logger.debug(`HttpServer server event: listening`)
    })

    this.server.on('request', (req, res) => {
      this.handleServerRequest(req, res).catch((error: unknown) => {
        this.logger.error(`HttpServer server request critical error`, {
          error: serializeError(error),
        })

        if (!res.writableEnded) {
          if (!res.headersSent) {
            res.writeHead(500, {
              'content-type': 'text/plain',
            })

            res.end(`Internal error`)
          } else {
            res.end()
          }
        }
      })
    })

    this.server.on('close', () => {
      this.logger.debug(`HttpServer server event: close`)
    })

    this.wss.on('listening', () => {
      this.logger.debug(`HttpServer wss event: listening`)
    })

    this.wss.on('connection', (ws, req) => {
      //ws.on('close', () => {})

      ws.on('error', (error) => {
        this.logger.error(`HttpServer ws event: error`, {
          error: serializeError(error),
        })

        ws.close()
      })

      this.handleWssConnection(ws, req).catch((error: unknown) => {
        this.logger.error(`HttpServer wss connection critical error`, {
          error: serializeError(error),
        })

        ws.close()
      })
    })

    this.wss.on('close', () => {
      this.logger.debug(`HttpServer wss event: close`)
    })
  }

  #isShutdown: boolean = false

  #isRunning: boolean = false

  async start(): Promise<void> {
    if (this.#isShutdown) {
      this.logger.debug(`HttpServer shutdown, skip start`)

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
        await this.waitUntilWssClose()

        await this.waitUntilServerClose()

        this.#isRunning = false

        this.logger.info(`HttpServer stopped and closed all connections`)
      } else {
        this.logger.debug(`HttpServer not running, skip stop`)
      }
    } catch (error) {
      this.#isRunning = false

      throw LifecycleError.wrap(error, {
        service: 'http-server',
        method: 'stop',
      })
    }
  }

  /**
   * Handles an incoming HTTP request.
   *
   * Creates a normal context and processes it through the middleware chain.
   *
   * @param req - The server request object.
   * @param res - The server response object.
   */
  protected async handleServerRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      await this.processNormalContext(req, res)
    } catch (error) {
      this.logger.error(`Processing normal context failed`, {
        error: serializeError(error),
      })

      const [status, message] =
        error instanceof HttpServerError ? [error.status, error.message] : [500, 'Internal error']

      const body = this.templater.render(this.options.errorPage, { status, message })

      if (!res.writableEnded) {
        if (!res.headersSent) {
          res.writeHead(status, {
            'content-type': 'text/html',
          })

          res.end(body)
        } else {
          res.end()
        }
      }
    }
  }

  /**
   * Handles an incoming WebSocket connection.
   *
   * Creates a WebSocket context and processes it through the middleware chain.
   *
   * @param ws - The WebSocket connection.
   * @param req - The server request object.
   */
  protected async handleWssConnection(ws: WebSocket, req: http.IncomingMessage): Promise<void> {
    try {
      await this.processWebSocketContext(ws, req)
    } catch (error) {
      this.logger.error(`Processing websocket context failed`, {
        error: serializeError(error),
      })

      ws.close()
    }
  }

  /**
   * Processes a normal HTTP request through the middleware chain.
   *
   * @param req - The server request object.
   * @param res - The server response object.
   * @throws HttpServerError If middleware processing fails.
   * @throws HttpServerError If no response is sent.
   */
  protected async processNormalContext(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const ctx = this.contextFactory.createNormal(req, res, {
        verbose: this.options.verbose,
        errorPage: this.options.errorPage,
      })

      await this.executeMiddlewareChain(ctx)

      if (ctx.isComplete) {
        if (ctx.state.verbose) {
          this.logger.debug(`HttpServer complete normal request`, {
            httpServer: {
              req: this.dumpRequest(req),
              ctx: ctx.dump(),
            },
          })
        }
      } else {
        throw HttpServerError.internalError(`Internal error`, {
          reason: `Incomplete server request`,
          ctx: ctx.dump(),
        })
      }
    } catch (error) {
      throw HttpServerError.wrap(error, {
        req: this.dumpRequest(req),
      })
    }
  }

  /**
   * Processes a WebSocket connection through the middleware chain.
   *
   * @param ws - The WebSocket connection.
   * @param req - The server request object.
   * @throws HttpServerError If middleware processing fails.
   * @throws HttpServerError If no response is sent.
   */
  protected async processWebSocketContext(ws: WebSocket, req: http.IncomingMessage): Promise<void> {
    try {
      const ctx = this.contextFactory.createWebSocket(ws, req, {
        verbose: this.options.verbose,
        errorPage: this.options.errorPage,
      })

      await this.executeMiddlewareChain(ctx)

      if (ctx.isComplete) {
        if (ctx.state.verbose) {
          this.logger.debug(`HttpServer complete websocket connection`, {
            httpServer: {
              req: this.dumpRequest(req),
              ctx: ctx.dump(),
            },
          })
        }
      } else {
        throw HttpServerError.internalError(`Internal error`, {
          reason: `Incomplete websocket connection`,
          ctx: ctx.dump(),
        })
      }
    } catch (error) {
      throw HttpServerError.wrap(error, {
        req: this.dumpRequest(req),
      })
    }
  }

  /**
   * Executes the middleware chain for a context.
   *
   * @param ctx - The HTTP context to process.
   * @throws HttpServerError If middleware processing fails.
   */
  protected async executeMiddlewareChain(ctx: HttpServerContext): Promise<void> {
    try {
      let index = -1

      const dispatch = async (idx: number): Promise<void> => {
        if (idx <= index) {
          throw new Error('Middleware next() called multiple times')
        }

        index = idx

        const middleware = this.router.getMiddleware(idx)

        if (middleware) {
          const [name, handler] = middleware

          ctx.trace.push(name)

          await handler(ctx, async () => {
            await dispatch(idx + 1)
          })
        }
      }

      await dispatch(0)
    } catch (error) {
      throw HttpServerError.wrap(error, {
        ctx: ctx.dump(),
      })
    }
  }

  /**
   * Actual start logic.
   */
  private async performStart(): Promise<void> {
    try {
      if (!this.#isRunning) {
        await this.waitUntilServerListening()

        this.#isRunning = true

        this.logger.info(`HttpServer started and listening`)
      } else {
        this.logger.debug(`HttpServer already running, skip start`)
      }
    } catch (error) {
      this.#isRunning = false

      throw LifecycleError.wrap(error, {
        service: 'http-server',
        method: 'start',
      })
    } finally {
      this.startPromise = null
    }
  }

  /**
   * Starts the HTTP server and listen connections.
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
   * Closes the WebSocket server and all connections.
   */
  private waitUntilWssClose(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        this.wss.off('close', onClose)
        this.wss.off('error', onError)
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
        reject(LifecycleError.create(`Wss close failed`, null, error))
      }

      this.wss.once('close', onClose)
      this.wss.once('error', onError)

      try {
        this.wss.close()
      } catch (error) {
        cleanup()
        reject(LifecycleError.create(`Wss close critical error`, null, error))
      }
    })
  }

  /**
   * Closes the HTTP server and all connections.
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

        this.server.closeAllConnections()
      } catch (error) {
        cleanup()
        reject(LifecycleError.create(`Server close critical error`, null, error))
      }
    })
  }

  /**
   * Converts validated configuration and settings to an http-server options.
   */
  private buildOptions(
    conf: NativeHttpServerConfig,
    settings: Partial<HttpServerSettings>
  ): NativeHttpServerOptions {
    return {
      address: conf.HTTP_SERVER_ADDRESS,
      port: conf.HTTP_SERVER_PORT,
      verbose: conf.HTTP_SERVER_VERBOSE,
      errorPage: settings.errorPage ?? HTTP_SERVER_DEFAULT_ERROR_PAGE,
    }
  }

  /**
   * Dumps a serializable representation of a request for logging.
   */
  private dumpRequest(req: http.IncomingMessage): object {
    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
    }
  }
}
