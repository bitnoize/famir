import { ErrorContext, filterSecrets, serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import http from 'node:http'
import { HttpServerError } from './http-server.errors.js'
import { HttpServer, HttpServerConfig, HttpServerOptions, Router } from './http-server.js'
import { httpServerSchemas } from './http-server.schemas.js'
import { buildOptions } from './http-server.utils.js'

export class ExpressHttpServer implements HttpServer {
  protected readonly options: HttpServerOptions
  private readonly _express: express.Express
  private readonly _server: http.Server

  constructor(
    validator: Validator,
    config: Config<HttpServerConfig>,
    protected readonly logger: Logger,
    routers: Router[]
  ) {
    validator.addSchemas(httpServerSchemas)

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

    routers.forEach((router) => {
      router.applyTo(this._express)
    })

    this._express.use(this.notFoundHandler)

    this._express.use(this.exceptionHandler)

    this.logger.info(
      {
        options: filterSecrets(this.options, [])
      },
      `HttpServer initialized`
    )
  }

  async listen(): Promise<void> {
    await this._listen()

    this.logger.info({}, `HttpServer listening`)
  }

  async close(): Promise<void> {
    await this._close()

    this.logger.info({}, `HttpServer closed`)
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
      new HttpServerError(
        500,
        {
          request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers
          }
        },
        `Unhandled request`
      )
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

    const renderException = (status: number, context: ErrorContext, message: string) => {
      if (status >= 500) {
        this.logger.error(context, message)
      } else {
        this.logger.warn(context, message)
      }

      res.type('text').status(status).send(message)
    }

    if (error instanceof HttpServerError) {
      renderException(error.status, error.context, error.message)
    } else {
      renderException(
        500,
        {
          request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers
          },
          cause: serializeError(error)
        },
        `HttpServer internal error`
      )
    }
  }
}
