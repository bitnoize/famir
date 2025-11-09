import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerShare,
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

  protected readonly preflightCorsHandler = (share: HttpServerShare) => {
    try {
      this.existsShareCampaign(share)

      const { response, campaign } = share

      response.isComplete = true
      response.status = 204

      const responseHeaders: HttpHeaders = {
        ...commonResponseHeaders,
        'content-type': 'text/plain',
        'access-control-allow-origin': campaign.mirrorDomain,
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      }

      Object.entries(responseHeaders).forEach(([name, value]) => {
        response.headers[name] = value
      })
    } catch (error) {
      this.exceptionWrapper(error, 'preflight-cors')
    }
  }

  protected readonly faviconIcoHandler = (share: HttpServerShare) => {
    try {
      this.existsShareTarget(share)

      const { target } = share

      const responseBody = Buffer.from(target.faviconIco, 'base64')
      const notFoundPageBody = Buffer.from(target.notFoundPage)

      const responseHeaders: HttpHeaders = {
        ...commonResponseHeaders,
        'content-type': 'image/x-icon',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      this.serveStaticFile(share, responseHeaders, responseBody, notFoundPageBody)
    } catch (error) {
      this.exceptionWrapper(error, 'faviconIco')
    }
  }

  protected readonly robotsTxtHandler = (share: HttpServerShare) => {
    try {
      this.existsShareTarget(share)

      const { target } = share

      const responseBody = Buffer.from(target.robotsTxt)
      const notFoundPageBody = Buffer.from(target.notFoundPage)

      const responseHeaders: HttpHeaders = {
        ...commonResponseHeaders,
        'content-type': 'text/plain',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      this.serveStaticFile(share, responseHeaders, responseBody, notFoundPageBody)
    } catch (error) {
      this.exceptionWrapper(error, 'robotsTxt')
    }
  }

  protected readonly sitemapXmlHandler = (share: HttpServerShare) => {
    try {
      this.existsShareTarget(share)

      const { target } = share

      const responseBody = Buffer.from(target.sitemapXml)
      const notFoundPageBody = Buffer.from(target.notFoundPage)

      const responseHeaders: HttpHeaders = {
        ...commonResponseHeaders,
        'content-type': 'application/xml',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      this.serveStaticFile(share, responseHeaders, responseBody, notFoundPageBody)
    } catch (error) {
      this.exceptionWrapper(error, 'sitemapXml')
    }
  }

  private serveStaticFile(
    share: HttpServerShare,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    notFoundPageBody: HttpBody,
  ) {
    const { request, response } = share

    response.isComplete = true

    if (responseBody.length > 0) {
      if (request.method === 'HEAD') {
        response.status = 200

        Object.entries(responseHeaders).forEach(([name, value]) => {
          response.headers[name] = value
        })

        return
      }

      if (request.method === 'GET') {
        response.status = 200
        response.body = responseBody

        Object.entries(responseHeaders).forEach(([name, value]) => {
          response.headers[name] = value
        })

        return
      }
    }

    response.status = 404
    response.body = notFoundPageBody

    const notFoundHeaders: HttpHeaders = {
      ...commonResponseHeaders,
      'content-type': 'text/html',
      'content-length': notFoundPageBody.length.toString(),
    }

    Object.entries(notFoundHeaders).forEach(([name, value]) => {
      response.headers[name] = value
    })
  }
}
