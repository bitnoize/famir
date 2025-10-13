import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerLocals,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouteHandler,
  HttpServerRouteHandlerSync,
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
    this.logger.debug(`HttpServerRouter initialized`)
  }

  applyTo(express: express.Express) {
    express.use('/', this._router)
  }

  protected existsRequestLocals(req: express.Request): asserts req is express.Request & {
    readonly locals: HttpServerLocals
  } {
    if (!req.locals) {
      throw new Error(`Express req.locals is not defined`)
    }
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
          this.existsRequestLocals(req)

          const request = this.buildRequest(req)

          const response = await handler(request, req.locals)

          this.sendResponse(res, next, response)
        } catch (error) {
          next(error)
        }
      }
    )
  }

  setHandlerSync(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandlerSync) {
    this._router[method](
      path,
      (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        try {
          this.existsRequestLocals(req)

          const request = this.buildRequest(req)

          const response = handler(request, req.locals)

          this.sendResponse(res, next, response)
        } catch (error) {
          next(error)
        }
      }
    )
  }

  private buildRequest(req: express.Request): HttpServerRequest {
    const request: HttpServerRequest = {
      ip: req.ip ?? '',
      method: req.method.toUpperCase(),
      url: req.originalUrl,
      path: req.path,
      params: req.params,
      headers: {},
      cookies: req.cookies,
      body: Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0)
    }

    Object.entries(req.headers).forEach(([name, value]) => {
      if (value == null) {
        return
      }

      request.headers[name] = value
    })

    return request
  }

  private sendResponse(
    res: express.Response,
    next: express.NextFunction,
    response: HttpServerResponse | undefined
  ) {
    if (!response) {
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

      if (cookie.value != null) {
        res.cookie(name, cookie.value, options)
      } else {
        res.clearCookie(name, options)
      }
    })

    res.status(response.status).send(response.body)
  }
}
