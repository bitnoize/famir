import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { commonResponseHeaders } from '../../reverse-proxy.utils.js'
import { BaseController } from '../base/index.js'

export const WELL_KNOWN_URLS_CONTROLLER = Symbol('WellKnownUrlsController')

export class WellKnownUrlsController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<WellKnownUrlsController>(
      WELL_KNOWN_URLS_CONTROLLER,
      (c) =>
        new WellKnownUrlsController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): WellKnownUrlsController {
    return container.resolve<WellKnownUrlsController>(WELL_KNOWN_URLS_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, 'well-known-urls')

    router.setHandler('options', '{*splat}', this.preflightCorsHandler)
    router.setHandler('all', '/favicon.ico', this.faviconIcoHandler)
    router.setHandler('all', '/robots.txt', this.robotsTxtHandler)
    router.setHandler('all', '/sitemap.xml', this.sitemapXmlHandler)
  }

  private readonly preflightCorsHandler = async (): Promise<HttpServerResponse> => {
    return {
      status: 204,
      headers: {
        ...commonResponseHeaders,
        'content-type': 'text/plain',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      },
      cookies: {},
      body: Buffer.alloc(0)
    }
  }

  private readonly faviconIcoHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      this.existsLocalsTarget(request.locals)

      const { target } = request.locals

      const body = Buffer.from(target.faviconIco, 'base64')

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'image/x-icon',
          'content-length': body.length.toString(),
          'last-modified': target.updatedAt.toUTCString(),
          'cache-control': 'public, max-age=691200'
        },
        cookies: {},
        body: Buffer.alloc(0)
      }

      if (request.method === 'HEAD') {
        return response
      }

      if (request.method === 'GET') {
        response.body = body

        return response
      }

      throw new HttpServerError(`Not found`, {
        code: 'NOT_FOUND',
        status: 404
      })
    } catch (error) {
      this.exceptionFilter(error, 'faviconIco', request)
    }
  }

  private readonly robotsTxtHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      this.existsLocalsTarget(request.locals)

      const { target } = request.locals

      const body = Buffer.from(target.robotsTxt)

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'text/plain',
          'content-length': body.length.toString(),
          'last-modified': target.updatedAt.toUTCString(),
          'cache-control': 'public, max-age=691200'
        },
        cookies: {},
        body: Buffer.alloc(0)
      }

      if (request.method === 'HEAD') {
        return response
      }

      if (request.method === 'GET') {
        response.body = body

        return response
      }

      throw new HttpServerError(`Not found`, {
        code: 'NOT_FOUND',
        status: 404
      })
    } catch (error) {
      this.exceptionFilter(error, 'robotsTxt', request)
    }
  }

  private readonly sitemapXmlHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      this.existsLocalsTarget(request.locals)

      const { target } = request.locals

      const body = Buffer.from(target.sitemapXml)

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'application/xml',
          'content-length': body.length.toString(),
          'last-modified': target.updatedAt.toUTCString(),
          'cache-control': 'public, max-age=691200'
        },
        cookies: {},
        body: Buffer.alloc(0)
      }

      if (request.method === 'HEAD') {
        return response
      }

      if (request.method === 'GET') {
        response.body = body

        return response
      }

      throw new HttpServerError(`Not found`, {
        code: 'NOT_FOUND',
        status: 404
      })
    } catch (error) {
      this.exceptionFilter(error, 'sitemapXml', request)
    }
  }
}
