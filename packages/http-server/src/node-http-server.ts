import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_SERVER,
  HTTP_SERVER_ROUTER,
  HttpServer,
  HttpServerContext,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerNextFunction,
  HttpServerRouter,
  Logger,
  LOGGER,
  TEMPLATER,
  Templater
} from '@famir/domain'
import http from 'node:http'
import { HttpServerConfig, HttpServerOptions } from './http-server.js'
import { NodeHttpServerContext } from './node-http-server-context.js'

export class NodeHttpServer implements HttpServer {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new NodeHttpServer(
          c.resolve<Config<HttpServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: HttpServerOptions
  protected readonly server: http.Server

  constructor(
    config: Config<HttpServerConfig>,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly router: HttpServerRouter
  ) {
    this.options = this.buildOptions(config.data)

    this.server = http.createServer()

    this.server.on('request', (req, res) => {
      this.logger.debug(`Server request event`, {
        request: this.dumpRequest(req)
      })

      this.handleServerRequest(req, res).catch((error: unknown) => {
        this.logger.fatal(`HttpServer unhandled error`, {
          error: serializeError(error),
          request: this.dumpRequest(req)
        })
      })
    })

    this.logger.debug(`HttpServer initialized`)
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

      this.logger.debug(`HttpServer listening`)
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

      this.server.closeAllConnections()

      this.logger.debug(`HttpServer closed`)
    })
  }

  protected async handleServerRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const ctx = new NodeHttpServerContext(req, res)

      const middlewares = this.router.getMiddlewares()

      const middleware = this.chainMiddlewares(middlewares)

      await middleware(ctx, async () => {})

      if (!ctx.isComplete) {
        throw new HttpServerError(`Incomplete request`, {
          code: 'INTERNAL_ERROR'
        })
      }
    } catch (error) {
      this.handleException(error, req, res)
    }
  }

  protected handleException(error: unknown, req: http.IncomingMessage, res: http.ServerResponse) {
    let status = 500,
      message = `Internal server error`

    try {
      if (error instanceof HttpServerError) {
        status = error.status
        message = error.message
      }

      this.logger.error(`HttpServer request error`, {
        error: serializeError(error),
        request: this.dumpRequest(req)
      })

      if (!res.headersSent) {
        const errorPage = this.templater.render(this.options.errorPage, {
          status,
          message
        })

        res.writeHead(status, {
          'content-type': 'text/html'
        })

        res.end(errorPage)
      } else {
        res.end()
      }
    } catch (criticalError) {
      this.logger.fatal(`HttpServer critical error`, {
        criticalError: serializeError(criticalError),
        request: this.dumpRequest(req)
      })

      if (!res.headersSent) {
        res.writeHead(status, {
          'content-type': 'text/plain'
        })

        res.end(message)
      } else {
        res.end()
      }
    }
  }

  protected chainMiddlewares(middlewares: HttpServerMiddleware[]): HttpServerMiddleware {
    return async (ctx: HttpServerContext, next?: HttpServerNextFunction): Promise<void> => {
      let index = -1

      const dispatch = async (i: number): Promise<void> => {
        if (i <= index) {
          throw new Error('next() called multiple times')
        }

        index = i

        const middleware = middlewares[i]

        if (middleware) {
          await middleware(ctx, () => dispatch(i + 1))
        }
      }

      await dispatch(0)
    }
  }

  private buildOptions(config: HttpServerConfig): HttpServerOptions {
    return {
      address: config.HTTP_SERVER_ADDRESS,
      port: config.HTTP_SERVER_PORT,
      bodyLimit: config.HTTP_SERVER_BODY_LIMIT,
      errorPage: config.HTTP_SERVER_ERROR_PAGE
    }
  }

  private dumpRequest(req: http.IncomingMessage): object {
    return {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  }
}
