import { serializeError } from '@famir/common'
import {
  Config,
  HttpServer,
  HttpServerError,
  HttpServerRouter,
  Logger,
  Validator
} from '@famir/domain'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import http from 'node:http'
import { HttpServerConfig, HttpServerOptions } from './http-server.js'
import { buildOptions, filterOptionsSecrets, internalSchemas } from './http-server.utils.js'

export class ExpressHttpServer implements HttpServer {
  protected readonly options: HttpServerOptions
  private readonly _express: express.Express
  private readonly _server: http.Server

  constructor(
    validator: Validator,
    config: Config<HttpServerConfig>,
    protected readonly logger: Logger,
    router: HttpServerRouter
  ) {
    validator.addSchemas(internalSchemas)

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

    this.logger.debug(
      {
        module: 'http-server',
        options: filterOptionsSecrets(this.options)
      },
      `HttpServer initialized`
    )
  }

  async listen(): Promise<void> {
    await this._listen()

    this.logger.debug(
      {
        module: 'http-server'
      },
      `HttpServer listening`
    )
  }

  async close(): Promise<void> {
    await this._close()

    this.logger.debug(
      {
        module: 'http-server'
      },
      `HttpServer closed`
    )
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
      new HttpServerError(`Unhandled request`, {
        context: {
          module: 'http-server'
        },
        code: 'UNKNOWN',
        status: 500
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
      const logLevel = error.status >= 500 ? 'error' : 'warn'

      this.logger[logLevel](
        {
          module: 'http-server',
          request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers
          },
          error: serializeError(error)
        },
        `Server handle error`
      )

      res.type('text').status(error.status).send(error.message)
    } else {
      this.logger.error(
        {
          module: 'http-server',
          request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers
          },
          error: serializeError(error)
        },
        `Server handle error`
      )

      res.type('text').status(500).send(`Server internal error`)
    }
  }
}
