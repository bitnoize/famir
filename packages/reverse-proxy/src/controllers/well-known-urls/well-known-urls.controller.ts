import { DIContainer } from '@famir/common'
import {
  EnabledFullTargetModel,
  HTTP_SERVER_ROUTER,
  HttpServerContext,
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
    super(validator, logger, router)

    this.router.addMiddleware(this.preflightCorsMiddleware)
    this.router.addMiddleware(this.faviconIcoMiddleware)
    this.router.addMiddleware(this.robotsTxtMiddleware)
    this.router.addMiddleware(this.sitemapXmlMiddleware)
  }

  protected preflightCorsMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      if (ctx.isMethod('OPTIONS')) {
        await this.renderPreflightCors(ctx)
      } else {
        await next()
      }
    } catch (error) {
      this.handleException(error, 'preflightCors')
    }
  }

  protected faviconIcoMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const target = this.getState(ctx, 'target')

      if (ctx.isUrlPathEquals('/favicon.ico')) {
        await this.renderFaviconIco(ctx, target)
      } else {
        await next()
      }
    } catch (error) {
      this.handleException(error, 'faviconIco')
    }
  }

  protected robotsTxtMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const target = this.getState(ctx, 'target')

      if (ctx.isUrlPathEquals('/robots.txt')) {
        await this.renderRobotsTxt(ctx, target)
      } else {
        await next()
      }
    } catch (error) {
      this.handleException(error, 'robotsTxt')
    }
  }

  protected sitemapXmlMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      const target = this.getState(ctx, 'target')

      if (ctx.isUrlPathEquals('/sitemap.xml')) {
        await this.renderSitemapXml(ctx, target)
      } else {
        await next()
      }
    } catch (error) {
      this.handleException(error, 'sitemapXml')
    }
  }

  protected async renderPreflightCors(ctx: HttpServerContext): Promise<void> {
    ctx.setResponseHeaders({
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    })

    ctx.setStatus(204)

    await ctx.sendResponse()
  }

  protected async renderFaviconIco(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.isMethods(['GET', 'HEAD'])) {
      const body = Buffer.from(target.faviconIco, 'base64')

      ctx.setResponseHeaders({
        'Content-Type': 'image/x-icon',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.isMethod('GET')) {
        ctx.setResponseBody(body)
      }

      ctx.setStatus(200)

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderRobotsTxt(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.isMethods(['GET', 'HEAD'])) {
      const body = Buffer.from(target.robotsTxt)

      ctx.setResponseHeaders({
        'Content-Type': 'text/plain',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.isMethod('GET')) {
        ctx.setResponseBody(body)
      }

      ctx.setStatus(200)

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderSitemapXml(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.isMethods(['GET', 'HEAD'])) {
      const body = Buffer.from(target.sitemapXml)

      ctx.setResponseHeaders({
        'Content-Type': 'application/xml',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.isMethod('GET')) {
        ctx.setResponseBody(body)
      }

      ctx.setStatus(200)

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }
}
