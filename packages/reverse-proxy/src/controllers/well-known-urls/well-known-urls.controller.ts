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
import { setHeaders } from '@famir/http-tools'
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

    this.router.register('preflightCors', this.preflightCors)
    this.router.register('faviconIco', this.faviconIco)
    this.router.register('robotsTxt', this.robotsTxt)
    this.router.register('sitemapXml', this.sitemapXml)

    this.logger.debug(`WellKnownUrlsController initialized`)
  }

  protected preflightCors: HttpServerMiddleware = async (ctx, next) => {
    if (ctx.method === 'OPTIONS') {
      await this.renderPreflightCors(ctx)
    } else {
      await next()
    }
  }

  protected faviconIco: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')

    if (ctx.url.pathname === '/favicon.ico') {
      await this.renderFaviconIco(ctx, target)
    } else {
      await next()
    }
  }

  protected robotsTxt: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')

    if (ctx.url.pathname === '/robots.txt') {
      await this.renderRobotsTxt(ctx, target)
    } else {
      await next()
    }
  }

  protected sitemapXml: HttpServerMiddleware = async (ctx, next) => {
    const target = this.getState(ctx, 'target')

    if (ctx.url.pathname === '/sitemap.xml') {
      await this.renderSitemapXml(ctx, target)
    } else {
      await next()
    }
  }

  protected async renderPreflightCors(ctx: HttpServerContext): Promise<void> {
    setHeaders(ctx.responseHeaders, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    })

    await ctx.sendResponseBody(204)
  }

  protected async renderFaviconIco(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (['GET', 'HEAD'].includes(ctx.method)) {
      const body = Buffer.from(target.faviconIco, 'base64')

      setHeaders(ctx.responseHeaders, {
        'Content-Type': 'image/x-icon',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method === 'GET') {
        await ctx.sendResponseBody(200, body)
      } else {
        await ctx.sendResponseBody(200)
      }
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderRobotsTxt(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (['GET', 'HEAD'].includes(ctx.method)) {
      const body = Buffer.from(target.robotsTxt)

      setHeaders(ctx.responseHeaders, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method === 'GET') {
        await ctx.sendResponseBody(200, body)
      } else {
        await ctx.sendResponseBody(200)
      }
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderSitemapXml(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (['GET', 'HEAD'].includes(ctx.method)) {
      const body = Buffer.from(target.sitemapXml)

      setHeaders(ctx.responseHeaders, {
        'Content-Type': 'application/xml',
        'Content-Length': body.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method === 'GET') {
        await ctx.sendResponseBody(200, body)
      } else {
        await ctx.sendResponseBody(200)
      }
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }
}
