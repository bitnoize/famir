import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerRouteHandler,
  HttpServerRouteMethod,
  HttpServerRouter,
  Logger,
  LOGGER
} from '@famir/domain'
import express from 'express'

export class ExpressHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new ExpressHttpServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

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

          const response = await handler({
            ip: req.ip ?? '',
            host: req.host,
            method: req.method.toUpperCase(),
            url: req.originalUrl,
            path: req.path,
            params: req.params,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
            body: Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0),
            locals: req.locals
          })

          if (response === undefined) {
            next()

            return
          }

          res.set(response.headers)

          Object.entries(response.cookies).forEach(([name, cookie]) => {
            const options: express.CookieOptions = {
              maxAge: cookie.maxAge,
              expires: cookie.expires,
              httpOnly: cookie.httpOnly,
              path: cookie.path,
              domain: cookie.domain,
              secure: cookie.secure,
              sameSite: cookie.sameSite
              //priority: cookie.priority,
              //partitioned: cookie.partitioned,
            }

            if (cookie.value !== undefined) {
              res.cookie(name, cookie.value, options)
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
        handler: [method, path]
      },
      `HttpServerRouter register handler`
    )
  }
}
