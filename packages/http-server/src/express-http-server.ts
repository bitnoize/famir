import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  HTTP_SERVER,
  HTTP_SERVER_ROUTER,
  HttpServer,
  HttpServerError,
  HttpServerRouter,
  Logger,
  LOGGER,
  TEMPLATER,
  Templater
} from '@famir/domain'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import http from 'node:http'
import { HttpServerConfig, HttpServerOptions } from './http-server.js'
import { buildOptions } from './http-server.utils.js'

export class ExpressHttpServer implements HttpServer {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServer>(
      HTTP_SERVER,
      (c) =>
        new ExpressHttpServer(
          c.resolve<Config<HttpServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: HttpServerOptions
  private readonly _express: express.Express
  private readonly _server: http.Server

  constructor(
    config: Config<HttpServerConfig>,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    router: HttpServerRouter
  ) {
    this.options = buildOptions(config.data)

    this._express = express()

    this._server = http.createServer(this._express)

    this._express.set('trust proxy', 1)
    this._express.set('case sensitive routing', false)
    this._express.set('strict routing', true)
    this._express.set('query parser', 'extended')
    this._express.set('x-powered-by', false)

    this._express.use(cookieParser())

    this._express.use(
      bodyParser.raw({
        limit: this.options.bodyLimit,
        type: '*/*'
      })
    )

    this._express.use(this.configureHandler)

    router.applyTo(this._express)

    this._express.use(this.notFoundHandler)

    this._express.use(this.exceptionHandler)

    this.logger.debug(`HttpServer initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  async listen(): Promise<void> {
    await this._listen()

    this.logger.debug(`HttpServer listening`)
  }

  async close(): Promise<void> {
    await this._close()

    this.logger.debug(`HttpServer closed`)
  }

  private _listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
  }

  private _close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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

      this._server.closeAllConnections()
    })
  }

  protected configureHandler = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    req.locals = {}

    next()
  }

  protected notFoundHandler = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    next(
      new HttpServerError(`Unhandled route request`, {
        code: 'INTERNAL_ERROR',
      })
    )
  }

  protected exceptionHandler = (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      next(error)

      return
    }

    if (error instanceof HttpServerError) {
      error.context['request'] = this.dumpRequest(req)

      const logLevel = error.status >= 500 ? 'error' : 'warn'

      this.logger[logLevel](`HttpServer request error`, {
        error: serializeError(error)
      })

      this.replyErrorPage(res, error.status, error.message)
    } else {
      this.logger.error(`HttpServer unhandled error`, {
        error: serializeError(error)
      })

      this.replyErrorPage(res, 500, `Internal server error`)
    }
  }

  private dumpRequest(req: express.Request): unknown {
    return {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      params: req.params,
      headers: req.headers,
      cookies: req.cookies,
      body: Buffer.isBuffer(req.body) ? req.body.length : 0
    }
  }

  private replyErrorPage(res: express.Response, status: number, message: string) {
    const errorPage = this.templater.render(this.options.errorPage, {
      status,
      message
    })

    res.type('html').status(status).send(errorPage)
  }
}
