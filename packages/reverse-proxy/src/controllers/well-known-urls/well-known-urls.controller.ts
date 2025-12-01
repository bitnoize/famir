import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpHeaders,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
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
    super(validator, logger, router, 'well-known-urls')

    this.router.addMiddleware(this.preflightCorsMiddleware)
    this.router.addMiddleware(this.faviconIcoMiddleware)
    this.router.addMiddleware(this.robotsTxtMiddleware)
    this.router.addMiddleware(this.sitemapXmlMiddleware)
  }

  private preflightCorsMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { campaign } = this.getConfigureState(ctx)

      const foundRoute = ctx.isMethod('OPTIONS')

      if (!foundRoute) {
        await next()

        return
      }

      const headers: HttpHeaders = {
        'content-type': 'text/plain',
        'access-control-allow-origin': campaign.mirrorDomain,
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      }

      ctx.prepareResponse(204, headers)

      await ctx.sendResponse()
    } catch (error) {
      this.handleException(error, 'preflightCors')
    }
  }

  private faviconIcoMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { target } = this.getConfigureState(ctx)

      const foundRoute =
        ctx.isMethods(['GET', 'HEAD']) && ctx.isUrlPathEquals('/favicon.ico') && target.faviconIco

      if (!foundRoute) {
        await next()

        return
      }

      const body = Buffer.from(target.faviconIco, 'base64')

      const headers: HttpHeaders = {
        'content-type': 'image/x-icon',
        'content-length': body.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      if (ctx.isMethod('GET')) {
        ctx.prepareResponse(200, headers, body)
      } else {
        ctx.prepareResponse(200, headers)
      }

      await ctx.sendResponse()
    } catch (error) {
      this.handleException(error, 'faviconIco')
    }
  }

  private robotsTxtMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { target } = this.getConfigureState(ctx)

      const foundRoute =
        ctx.isMethods(['GET', 'HEAD']) && ctx.isUrlPathEquals('/robots.txt') && target.robotsTxt

      if (!foundRoute) {
        await next()

        return
      }

      const body = Buffer.from(target.robotsTxt)

      const headers: HttpHeaders = {
        'content-type': 'text/plain',
        'content-length': body.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      if (ctx.isMethod('GET')) {
        ctx.prepareResponse(200, headers, body)
      } else {
        ctx.prepareResponse(200, headers)
      }

      await ctx.sendResponse()
    } catch (error) {
      this.handleException(error, 'robotsTxt')
    }
  }

  private sitemapXmlMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const { target } = this.getConfigureState(ctx)

      const foundRoute =
        ctx.isMethods(['GET', 'HEAD']) && ctx.isUrlPathEquals('/sitemap.xml') && target.sitemapXml

      if (!foundRoute) {
        await next()

        return
      }

      const body = Buffer.from(target.sitemapXml)

      const headers: HttpHeaders = {
        'content-type': 'application/xml',
        'content-length': body.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      }

      if (ctx.isMethod('GET')) {
        ctx.prepareResponse(200, headers, body)
      } else {
        ctx.prepareResponse(200, headers)
      }

      await ctx.sendResponse()
    } catch (error) {
      this.handleException(error, 'sitemapXml')
    }
  }
}
