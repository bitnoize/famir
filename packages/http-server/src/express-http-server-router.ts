import { HttpServerRouteHandler, HttpServerRouteMethod, HttpServerRouter } from '@famir/domain'
import express from 'express'

export class ExpressHttpServerRouter implements HttpServerRouter {
  private readonly _router = express.Router()

  constructor(private readonly basePath = '/') {}

  applyTo(express: express.Express) {
    express.use(this.basePath, this._router)
  }

  addRoute(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandler) {
    this._router[method](
      path,
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): Promise<void> => {
        try {
          const locals = req.locals
          if (locals === undefined) {
            throw new Error(`Request locals is not defined`)
          }

          const body: unknown = req.body
          if (!(body === undefined || Buffer.isBuffer(body))) {
            throw new Error(`Request body is not a buffer`)
          }

          const response = await handler(locals, {
            ip: req.ip,
            host: req.host,
            method: req.method.toUpperCase(),
            url: req.originalUrl,
            path: req.path,
            params: req.params,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
            body
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
  }
}
