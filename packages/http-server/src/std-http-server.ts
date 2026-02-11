import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_SERVER,
  HTTP_SERVER_ROUTER,
  HttpServer,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter,
  Logger,
  LOGGER,
  TEMPLATER,
  Templater
} from '@famir/domain'
import http from 'node:http'
import { StdHttpServerConfig, StdHttpServerOptions } from './http-server.js'
import { StdHttpServerContext } from './std-http-server-context.js'

export class StdHttpServer implements HttpServer {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new StdHttpServer(
          c.resolve<Config<StdHttpServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: StdHttpServerOptions
  protected readonly server: http.Server

  constructor(
    config: Config<StdHttpServerConfig>,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly router: HttpServerRouter
  ) {
    this.options = this.buildOptions(config.data)

    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res).catch((error: unknown) => {
        this.logger.error(`HttpServer request unhandled error`, {
          error: serializeError(error),
          request: this.dumpRequest(req)
        })
      })
    })

    this.logger.debug(`HttpServer initialized`)
  }

  async start(): Promise<void> {
    await this.listen()

    this.logger.debug(`HttpServer started`)
  }

  async stop(): Promise<void> {
    await this.close()

    this.logger.debug(`HttpServer stopped`)
  }

  protected async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const ctx = new StdHttpServerContext(req, res)

      await this.chainMiddlewares(ctx)

      if (!ctx.isComplete) {
        throw new HttpServerError(`Incomplete request`, {
          code: 'INTERNAL_ERROR'
        })
      }
    } catch (error) {
      this.handleRequestError(error, req, res)
    }
  }

  protected handleRequestError(
    error: unknown,
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    let status = 500,
      message = `Internal server error`

    try {
      this.logger.error(`HttpServer request error`, {
        error: serializeError(error),
        request: this.dumpRequest(req)
      })

      if (error instanceof HttpServerError) {
        status = error.status
        message = error.message
      }

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
      this.logger.fatal(`HttpServer request critical error`, {
        criticalError: serializeError(criticalError)
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

  protected async chainMiddlewares(ctx: HttpServerContext): Promise<void> {
    try {
      const middlewares = this.router.resolve()

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
        throw new HttpServerError(`Server unknown error`, {
          cause: error,
          context: {
            middlewares: ctx.middlewares
          },
          code: 'INTERNAL_ERROR'
        })
      }
    }
  }

  protected listen(): Promise<void> {
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

  protected close(): Promise<void> {
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

  private buildOptions(config: StdHttpServerConfig): StdHttpServerOptions {
    return {
      address: config.HTTP_SERVER_ADDRESS,
      port: config.HTTP_SERVER_PORT,
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
