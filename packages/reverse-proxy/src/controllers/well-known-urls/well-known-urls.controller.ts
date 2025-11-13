import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
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
    super(validator, logger, templater, router, 'well-known-urls')

    this.router.addMiddleware('well-known-urls', this.preflightCorsMiddleware)
    this.router.addMiddleware('well-known-urls', this.faviconIcoMiddleware)
    this.router.addMiddleware('well-known-urls', this.robotsTxtMiddleware)
    this.router.addMiddleware('well-known-urls', this.sitemapXmlMiddleware)
  }

  private preflightCorsMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)

      const isFound = ctx.isMethod('OPTIONS')

      if (!isFound) {
        await next()

        return
      }

      const { campaign } = ctx.state

      ctx.setResponseHeaders({
        'content-type': 'text/plain',
        'access-control-allow-origin': campaign.mirrorDomain,
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      })

      await ctx.sendResponse(204)
    } catch (error) {
      this.handleException(error, 'preflightCors')
    }
  }

  private faviconIcoMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateTarget(ctx.state)

      const { target } = ctx.state

      const isFound =
        ctx.isMethods(['GET', 'HEAD']) && ctx.originUrl === '/favicon.ico' && target.faviconIco

      if (!isFound) {
        await next()

        return
      }

      const responseBody = Buffer.from(target.faviconIco, 'base64')

      ctx.setResponseHeaders({
        'content-type': 'image/x-icon',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      })

      if (ctx.isMethod('GET')) {
        ctx.responseBody = responseBody
      }

      await ctx.sendResponse(200)
    } catch (error) {
      this.handleException(error, 'faviconIco')
    }
  }

  private robotsTxtMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateTarget(ctx.state)

      const { target } = ctx.state

      const isFound =
        ctx.isMethods(['GET', 'HEAD']) && ctx.originUrl === '/robots.txt' && target.robotsTxt

      if (!isFound) {
        await next()

        return
      }

      const responseBody = Buffer.from(target.robotsTxt)

      ctx.setResponseHeaders({
        'content-type': 'image/x-icon',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      })

      if (ctx.isMethod('GET')) {
        ctx.responseBody = responseBody
      }

      await ctx.sendResponse(200)
    } catch (error) {
      this.handleException(error, 'robotsTxt')
    }
  }

  private sitemapXmlMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateTarget(ctx.state)

      const { target } = ctx.state

      const isFound =
        ctx.isMethods(['GET', 'HEAD']) && ctx.originUrl === '/sitemap.xml' && target.sitemapXml

      if (!isFound) {
        await next()

        return
      }

      const responseBody = Buffer.from(target.sitemapXml)

      ctx.setResponseHeaders({
        'content-type': 'image/x-icon',
        'content-length': responseBody.length.toString(),
        'last-modified': target.updatedAt.toUTCString(),
        'cache-control': 'public, max-age=691200'
      })

      if (ctx.isMethod('GET')) {
        ctx.responseBody = responseBody
      }

      await ctx.sendResponse(200)
    } catch (error) {
      this.handleException(error, 'sitemapXml')
    }
  }
}
