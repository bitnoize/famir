import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import http from 'node:http'
import WebSocket, { WebSocketServer } from 'ws'
import { HttpServerRouter } from './http-server-router.js'
import { HttpServerError } from './http-server.error.js'
import {
  HTTP_SERVER,
  HTTP_SERVER_CONTEXT_FACTORY,
  HTTP_SERVER_ERROR_PAGE,
  HTTP_SERVER_ROUTER,
  HttpServer,
  HttpServerContext,
  HttpServerContextFactory,
  NativeHttpServerConfig,
  NativeHttpServerOptions,
} from './http-server.js'

/**
 * Native HTTP server implementation
 *
 * @category none
 */
export class NativeHttpServer implements HttpServer {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new NativeHttpServer(
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(TEMPLATER),
          c.resolve(HTTP_SERVER_ROUTER),
          c.resolve(HTTP_SERVER_CONTEXT_FACTORY)
        )
    )
  }

  protected readonly options: NativeHttpServerOptions
  protected readonly server: http.Server
  protected readonly wsServer: WebSocketServer

  constructor(
    protected readonly config: Config<NativeHttpServerConfig>,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly router: HttpServerRouter,
    protected readonly contextFactory: HttpServerContextFactory
  ) {
    this.options = this.buildOptions(config.data)

    this.server = http.createServer()

    this.wsServer = new WebSocketServer({
      server: this.server,
      clientTracking: true,
      autoPong: true,
    })

    this.server.on('request', (req, res) => {
      this.handleNormalRequest(req, res).catch((error: unknown) => {
        this.logger.error(`HttpServer unexpected normal request error`, {
          error: serializeError(error),
          request: this.dumpRequest(req),
        })

        if (!res.writableEnded) {
          if (!res.headersSent) {
            res.writeHead(500, {
              'content-type': 'text/plain',
            })

            res.end(`Server internal error`)
          } else {
            res.end()
          }
        }
      })
    })

    this.wsServer.on('connection', (ws, req) => {
      ws.on('close', () => {})

      ws.on('error', (error) => {
        this.logger.error(`HttpServer websocket error`, {
          error: serializeError(error),
        })

        ws.close()
      })

      this.handleWebSocketConnection(ws, req).catch((error: unknown) => {
        this.logger.error(`HttpServer unexpected websocket connection error`, {
          error: serializeError(error),
          request: this.dumpRequest(req),
        })

        ws.close()
      })
    })

    this.logger.debug(`HttpServer initialized`)
  }

  async start(): Promise<void> {
    await this.listen()

    this.logger.debug(`HttpServer started`)
  }

  async stop(): Promise<void> {
    await this.closeWs()
    await this.close()

    this.logger.debug(`HttpServer stopped`)
  }

  private async handleNormalRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const ctx = this.contextFactory.createNormal(req, res, {
        verbose: this.options.verbose,
        errorPage: this.getErrorPage(),
      })

      await this.chainMiddlewares(ctx)

      if (!ctx.isComplete) {
        throw new HttpServerError(`Server internal error`, {
          context: {
            reason: `No response after processing all middlewares`,
          },
          code: 'INTERNAL_ERROR',
        })
      }
    } catch (error) {
      this.logger.error(`HttpServer handle normal request error`, {
        error: serializeError(error),
        request: this.dumpRequest(req),
      })

      const [status, message] =
        error instanceof HttpServerError
          ? [error.status, error.message]
          : [500, 'Server internal error']

      const body = this.templater.render(this.getErrorPage(), {
        status,
        message,
      })

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

  private async handleWebSocketConnection(ws: WebSocket, req: http.IncomingMessage): Promise<void> {
    try {
      const ctx = this.contextFactory.createWebSocket(ws, req, {
        verbose: this.options.verbose,
        errorPage: this.getErrorPage(),
      })

      await this.chainMiddlewares(ctx)

      if (!ctx.isComplete) {
        throw new HttpServerError(`Server internal error`, {
          context: {
            reason: `No response after processing all middlewares`,
          },
          code: 'INTERNAL_ERROR',
        })
      }
    } catch (error) {
      this.logger.error(`HttpServer handle websocket connection error`, {
        error: serializeError(error),
        request: this.dumpRequest(req),
      })

      ws.close()
    }
  }

  private async chainMiddlewares(ctx: HttpServerContext): Promise<void> {
    try {
      const middlewares = this.router.getMiddlewares()

      let index = -1

      const dispatch = async (idx: number): Promise<void> => {
        if (idx <= index) {
          throw new Error('Middleware next() called multiple times')
        }

        index = idx

        if (middlewares[idx]) {
          const [name, middleware] = middlewares[idx]

          ctx.middlewares.push(name)

          await middleware(ctx, async () => {
            await dispatch(idx + 1)
          })
        }
      }

      await dispatch(0)
    } catch (error) {
      if (error instanceof HttpServerError) {
        error.context['middlewares'] = ctx.middlewares

        throw error
      } else {
        throw new HttpServerError(`Server internal error`, {
          cause: error,
          context: {
            middlewares: ctx.middlewares,
            reason: `Unknown middleware error`,
          },
          code: 'INTERNAL_ERROR',
        })
      }
    }
  }

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

      this.server.closeAllConnections()
    })
  }

  private closeWs(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.wsServer.off('close', closeHandler)

        reject(error)
      }

      const closeHandler = () => {
        this.wsServer.off('error', errorHandler)

        resolve()
      }

      this.wsServer.once('error', errorHandler)
      this.wsServer.once('close', closeHandler)

      this.wsServer.close()
    })
  }

  private getErrorPage(): string {
    return this.router.getAsset('error-page.html') ?? HTTP_SERVER_ERROR_PAGE
  }

  private dumpRequest(req: http.IncomingMessage): object {
    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
    }
  }

  private buildOptions(config: NativeHttpServerConfig): NativeHttpServerOptions {
    return {
      address: config.HTTP_SERVER_ADDRESS,
      port: config.HTTP_SERVER_PORT,
      verbose: config.HTTP_SERVER_VERBOSE,
    }
  }
}
