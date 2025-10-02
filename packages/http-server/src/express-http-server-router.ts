import {
  HttpServerRouteHandler,
  HttpServerRouteMethod,
  HttpServerRouter,
  Logger
} from '@famir/domain'
import express from 'express'

export class ExpressHttpServerRouter implements HttpServerRouter {
  private readonly _router = express.Router()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(
      {
        module: 'http-server'
      },
      `HttpServerRouter initialized`
    )
  }

  applyTo(express: express.Express) {
    express.use('/', this._router)
  }

  setHandler(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandler) {
    this._router[method](
      path,
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): Promise<void> => {
        try {
          if (req.locals === undefined) {
            throw new Error(`Request locals is not defined`)
          }

          if (!(req.body === undefined || Buffer.isBuffer(req.body))) {
            throw new Error(`Request body is not a buffer`)
          }

          const response = await handler({
            locals: req.locals,
            ip: req.ip,
            host: req.host,
            method: req.method.toUpperCase(),
            url: req.originalUrl,
            path: req.path,
            params: req.params,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
            body: req.body
          })

          if (response == null) {
            next()

            return
          }

          res.set(response.headers)

          Object.entries(response.cookies).forEach(([name, [value, options]]) => {
            if (value !== undefined) {
              res.cookie(name, value, options)
            } else {
              res.clearCookie(name, options)
            }
          })

          res.status(response.status).send(response.body)
        } catch (error) {
          next(error)
        }
      }
    )

    this.logger.debug(
      {
        module: 'http-server',
        handler: {
          method,
          path
        }
      },
      `HttpServerRouter register handler`
    )
  }
}
