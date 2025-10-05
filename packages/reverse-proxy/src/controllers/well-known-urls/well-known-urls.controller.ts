import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { assertRequestLocalsTarget } from '../../reverse-proxy.utils.js'
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

    router.setHandler('get', '/favicon.ico', this.faviconIcoHandler)
    router.setHandler('get', '/robots.txt', this.robotsTxtHandler)
    router.setHandler('get', '/sitemap.xml', this.sitemapXmlHandler)
  }

  private readonly faviconIcoHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      assertRequestLocalsTarget(request)

      const { target } = request.locals

      const body = Buffer.from(target.faviconIco, 'base64')

      return {
        status: 200,
        headers: {
          'content-type': 'image/x-icon',
          'content-length': body.length.toString()
        },
        cookies: {},
        body
      }
    } catch (error) {
      this.exceptionFilter(error, 'faviconIco', request)
    }
  }

  private readonly robotsTxtHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      assertRequestLocalsTarget(request)

      const { target } = request.locals

      const body = Buffer.from(target.robotsTxt)

      return {
        status: 200,
        headers: {
          'content-type': 'text/plain',
          'content-length': body.length.toString()
        },
        cookies: {},
        body
      }
    } catch (error) {
      this.exceptionFilter(error, 'robotsTxt', request)
    }
  }

  private readonly sitemapXmlHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse> => {
    try {
      assertRequestLocalsTarget(request)

      const { target } = request.locals

      const body = Buffer.from(target.sitemapXml)

      return {
        status: 200,
        headers: {
          'content-type': 'text/plain',
          'content-length': body.length.toString()
        },
        cookies: {},
        body
      }
    } catch (error) {
      this.exceptionFilter(error, 'sitemapXml', request)
    }
  }
}
