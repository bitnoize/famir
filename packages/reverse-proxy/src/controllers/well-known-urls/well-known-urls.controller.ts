import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerLocals,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
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
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): WellKnownUrlsController {
    return container.resolve<WellKnownUrlsController>(WELL_KNOWN_URLS_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter
  ) {
    super(validator, logger, templater, 'well-known-urls')

    router.setHandlerSync('options', '{*splat}', this.preflightCorsHandler)
    router.setHandlerSync('all', '/favicon.ico', this.faviconIcoHandler)
    router.setHandlerSync('all', '/robots.txt', this.robotsTxtHandler)
    router.setHandlerSync('all', '/sitemap.xml', this.sitemapXmlHandler)
  }

  private readonly preflightCorsHandler = (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): HttpServerResponse => {
    try {
      this.existsLocalsCampaign(locals)

      return {
        status: 204,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'text/plain',
          'access-control-allow-origin': locals.campaign.mirrorDomain,
          'access-control-allow-methods': '*',
          'access-control-allow-headers': '*',
          'access-control-expose-headers': '*',
          'access-control-allow-credentials': 'true',
          'access-control-max-age': '86400'
        },
        cookies: {},
        body: Buffer.alloc(0)
      }
    } catch (error) {
      this.exceptionWrapper(error, 'preflight-cors')
    }
  }

  private readonly faviconIcoHandler = (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): HttpServerResponse => {
    try {
      this.existsLocalsTarget(locals)

      const body = Buffer.from(locals.target.faviconIco, 'base64')

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'image/x-icon',
          'content-length': body.length.toString(),
          'last-modified': locals.target.updatedAt.toUTCString(),
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
        code: 'NOT_FOUND'
      })
    } catch (error) {
      this.exceptionWrapper(error, 'faviconIco')
    }
  }

  private readonly robotsTxtHandler = (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): HttpServerResponse => {
    try {
      this.existsLocalsCampaign(locals)
      this.existsLocalsTarget(locals)

      const { campaign, target } = locals

      const robotsTxt = this.templater.render(target.robotsTxt, {
        mirrorDomain: campaign.mirrorDomain,
        mirrorSecure: target.mirrorSecure,
        mirrorSub: target.mirrorSub,
        mirrorPort: target.mirrorPort
      })

      const body = Buffer.from(robotsTxt)

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'text/plain',
          'content-length': body.length.toString(),
          'last-modified': locals.target.updatedAt.toUTCString(),
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
        code: 'NOT_FOUND'
      })
    } catch (error) {
      this.exceptionWrapper(error, 'robotsTxt')
    }
  }

  private readonly sitemapXmlHandler = (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): HttpServerResponse => {
    try {
      this.existsLocalsTarget(locals)

      const body = Buffer.from(locals.target.sitemapXml)

      const response: HttpServerResponse = {
        status: 200,
        headers: {
          ...commonResponseHeaders,
          'content-type': 'application/xml',
          'content-length': body.length.toString(),
          'last-modified': locals.target.updatedAt.toUTCString(),
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
        code: 'NOT_FOUND'
      })
    } catch (error) {
      this.exceptionWrapper(error, 'sitemapXml')
    }
  }
}
