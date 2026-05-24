import { BootstrapError, DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import http from 'node:http'
import WebSocket, { WebSocketServer } from 'ws'
import {
  HTTP_SERVER_ASSET_ERROR_PAGE,
  HTTP_SERVER_ASSETS,
  HttpServerAssets,
} from './http-server-assets.js'
import {
  HTTP_SERVER_CONTEXT_FACTORY,
  HttpServerContextFactory,
} from './http-server-context-factory.js'
import { HttpServerContext } from './http-server-context.js'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from './http-server-router.js'
import { HttpServerError } from './http-server.error.js'
import { HTTP_SERVER, HttpServer, NativeHttpServerConfig } from './http-server.js'
import { nativeHttpServerConfigSchema } from './http-server.schemas.js'

/**
 * Options for a Native http-server.
 */
interface NativeHttpServerOptions {
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
 * - {@link HttpServerAssets} via {@link HTTP_SERVER_ASSETS} token
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
  static register(container: DIContainer) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new NativeHttpServer(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<HttpServerContextFactory>(HTTP_SERVER_CONTEXT_FACTORY)
        )
    )
  }

  /** Built http-server options. */
  protected readonly options: NativeHttpServerOptions

  /** Underlying Node.js HTTP server instance. */
  protected readonly server: http.Server

  /** Underlying WebSocket server instance. */
  protected readonly wss: WebSocketServer

  /**
   * Creates a new http-server instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param contextFactory - The context factory instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: HttpServerAssets,
    protected readonly router: HttpServerRouter,
    protected readonly contextFactory: HttpServerContextFactory
  ) {
    this.validator.addSchema('http-server-config', nativeHttpServerConfigSchema)

    const configData = this.config.get<NativeHttpServerConfig>('http-server-config')
    this.options = this.buildOptions(configData)

    this.server = http.createServer()

    this.wss = new WebSocketServer({
      server: this.server,
      clientTracking: true,
      autoPong: true,
    })

    this.server.on('listening', () => {
      this.logger.info(`HttpServer server event: listening`)
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
      this.logger.info(`HttpServer server event: close`)
    })

    this.wss.on('listening', () => {
      this.logger.info(`HttpServer wss event: listening`)
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
      this.logger.info(`HttpServer wss event: close`)
    })
  }

  #isRunning: boolean = false

  async start(): Promise<void> {
    try {
      if (!this.#isRunning) {
        this.#isRunning = true

        await this.listen()

        this.logger.debug(`HttpServer started and listening`)
      } else {
        this.logger.debug(`HttpServer already started`)
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

        this.logger.debug(`HttpServer stopped and closed all connections`)
      } else {
        this.logger.debug(`HttpServer already stopped`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'stop')
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
      this.logger.error(`Processing Normal context failed`, {
        error: serializeError(error),
      })

      const [status, message] =
        error instanceof HttpServerError ? [error.status, error.message] : [500, 'Internal error']

      const body = this.templater.render(this.getErrorPage(), { status, message })

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
      this.logger.error(`Processing WebSocket context failed`, {
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
   * @throws {@link HttpServerError} If middleware processing fails.
   * @throws {@link HttpServerError} If no response is sent.
   */
  protected async processNormalContext(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const ctx = this.contextFactory.createNormal(req, res, {
        verbose: this.options.verbose,
        errorPage: this.getErrorPage(),
      })

      await this.executeMiddleware(ctx)

      if (!ctx.isComplete) {
        throw new HttpServerError(`Internal error`, {
          context: {
            reason: `No response after processing Normal context`,
          },
          code: 'INTERNAL_ERROR',
        })
      }
    } catch (error) {
      this.handleContextError(error, req)
    }
  }

  /**
   * Processes a WebSocket connection through the middleware chain.
   *
   * @param ws - The WebSocket connection.
   * @param req - The server request object.
   * @throws {@link HttpServerError} If middleware processing fails.
   * @throws {@link HttpServerError} If no response is sent.
   */
  protected async processWebSocketContext(ws: WebSocket, req: http.IncomingMessage): Promise<void> {
    try {
      const ctx = this.contextFactory.createWebSocket(ws, req, {
        verbose: this.options.verbose,
        errorPage: this.getErrorPage(),
      })

      await this.executeMiddleware(ctx)

      if (!ctx.isComplete) {
        throw new HttpServerError(`Internal error`, {
          context: {
            reason: `No response after processing WebSocket context`,
          },
          code: 'INTERNAL_ERROR',
        })
      }
    } catch (error) {
      this.handleContextError(error, req)
    }
  }

  /**
   * Executes the middleware chain for a context.
   *
   * @param ctx - The HTTP context to process.
   * @throws {@link HttpServerError} If middleware processing fails.
   */
  protected async executeMiddleware(ctx: HttpServerContext): Promise<void> {
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
        } else {
          if (this.options.verbose) {
            this.logger.debug(`Complete middleware chain`, {
              ctx: ctx.dump(),
            })
          }
        }
      }

      await dispatch(0)
    } catch (error) {
      this.handleMiddlewareError(error, ctx)
    }
  }

  /**
   * Handles bootstrap operation errors.
   *
   * Re-throws `BootstrapError` instances with additional context, or wraps
   * unknown errors into a `BootstrapError`.
   *
   * @param error - The caught error.
   * @param method - The method where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleBootstrapError(error: unknown, method: string): never {
    if (error instanceof BootstrapError) {
      error.context['service'] = 'http-server'
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'http-server',
          method,
        },
      })
    }
  }

  /**
   * Handles context operation errors.
   *
   * Re-throws `HttpServerError` instances with additional context, or wraps
   * unknown errors into a `HttpServerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param req - The request object where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleContextError(error: unknown, req: http.IncomingMessage): never {
    if (error instanceof HttpServerError) {
      error.context['level'] = 'context'
      error.context['request'] = this.dumpRequest(req)

      throw error
    } else {
      throw new HttpServerError(`Unknown error`, {
        cause: error,
        context: {
          level: 'context',
          request: this.dumpRequest(req),
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Handles middleware operation errors.
   *
   * Re-throws `HttpServerError` instances with additional context, or wraps
   * unknown errors into a `HttpServerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param ctx - The context object where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleMiddlewareError(error: unknown, ctx: HttpServerContext): never {
    if (error instanceof HttpServerError) {
      error.context['level'] = 'middleware'
      error.context['ctx'] = ctx.dump()

      throw error
    } else {
      throw new HttpServerError(`Unknown error`, {
        cause: error,
        context: {
          level: 'middleware',
          ctx: ctx.dump(),
        },
        code: 'INTERNAL_ERROR',
      })
    }
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
   * Closes both the WebSocket and HTTP servers.
   *
   * @throws {@link BootstrapError} If closing fails.
   */
  private async close(): Promise<void> {
    const results = await Promise.allSettled([this.closeWss(), this.closeServer()])

    const errors = results.reduce<unknown[]>((acc, result) => {
      if (result.status === 'rejected') {
        acc.push(result.reason)
      }

      return acc
    }, [])

    if (errors.length > 0) {
      throw new BootstrapError(`HttpServer close wss and server failed`, {
        cause: errors,
      })
    }
  }

  /**
   * Closes the WebSocket server and all connections.
   *
   * @returns A promise that resolves when the server is closed.
   */
  private closeWss(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.wss.off('close', closeHandler)

        reject(error)
      }

      const closeHandler = () => {
        this.wss.off('error', errorHandler)

        resolve()
      }

      this.wss.once('error', errorHandler)
      this.wss.once('close', closeHandler)

      this.wss.close()
    })
  }

  /**
   * Closes the HTTP server and all connections.
   *
   * @returns A promise that resolves when the server is closed.
   */
  private closeServer(): Promise<void> {
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

      this.server.closeAllConnections()
    })
  }

  /**
   * Converts validated configuration to an http-server options.
   *
   * @param data - The validated configuration object.
   * @returns The http-server options object.
   */
  private buildOptions(data: NativeHttpServerConfig): NativeHttpServerOptions {
    return {
      address: data.HTTP_SERVER_ADDRESS,
      port: data.HTTP_SERVER_PORT,
      verbose: data.HTTP_SERVER_VERBOSE,
    }
  }

  /**
   * Dumps a serializable representation of a request for logging.
   *
   * @param req - The request to serialize.
   * @returns A plain object with request details.
   */
  private dumpRequest(req: http.IncomingMessage): object {
    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
    }
  }

  /**
   * Retrieves the error page asset.
   *
   * @returns The asset content.
   */
  private getErrorPage(): string {
    return this.assets.get('error-page.html') ?? HTTP_SERVER_ASSET_ERROR_PAGE
  }
}
