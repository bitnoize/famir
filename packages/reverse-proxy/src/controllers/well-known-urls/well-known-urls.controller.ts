import { DIContainer } from '@famir/common'
import { EnabledFullTargetModel } from '@famir/database'
import { HTTP_SERVER_ROUTER, HttpServerContext, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'

export const WELL_KNOWN_URLS_CONTROLLER = Symbol('WellKnownUrlsController')

export class WellKnownUrlsController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
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
    return container.resolve(WELL_KNOWN_URLS_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.logger.debug(`WellKnownUrlsController initialized`)
  }

  use() {
    this.router.register('well-known-urls', async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      if (ctx.url.isPathEquals('/favicon.ico')) {
        await this.renderFaviconIco(ctx, target)
      } else if (ctx.url.isPathEquals('/robots.txt')) {
        await this.renderRobotsTxt(ctx, target)
      } else if (ctx.url.isPathEquals('/sitemap.xml')) {
        await this.renderSitemapXml(ctx, target)
      } else {
        await next()
      }
    })
  }

  protected async renderFaviconIco(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      ctx.status.set(200)

      ctx.responseBody.setBase64(target.faviconIco)

      ctx.responseHeaders.merge({
        'Content-Type': 'image/x-icon',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderRobotsTxt(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      ctx.status.set(200)

      ctx.responseBody.setText(target.robotsTxt)

      ctx.responseHeaders.merge({
        'Content-Type': 'text/plain',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }

  protected async renderSitemapXml(
    ctx: HttpServerContext,
    target: EnabledFullTargetModel
  ): Promise<void> {
    if (ctx.method.is(['GET', 'HEAD'])) {
      ctx.status.set(200)

      ctx.responseBody.setText(target.sitemapXml)

      ctx.responseHeaders.merge({
        'Content-Type': 'application/xml',
        'Content-Length': ctx.responseBody.length.toString(),
        'Last-Modified': target.updatedAt.toUTCString(),
        'Cache-Control': 'public, max-age=86400'
      })

      if (ctx.method.is('HEAD')) {
        ctx.responseBody.reset()
      }

      await ctx.sendResponse()
    } else {
      await this.renderNotFoundPage(ctx, target)
    }
  }
}

  /*
  protected async renderPreflightCors(ctx: HttpServerContext): Promise<void> {
    ctx.status.set(204)

    ctx.responseHeaders.merge({
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    })

    await ctx.sendResponse()
  }
  */


