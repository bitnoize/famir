import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { WELL_KNOWN_URLS_CONTROLLER, WellKnownUrlsDispatchContextType } from './well-known-urls.js'

/*
 * Well known urls controller
 */
export class WellKnownUrlsController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
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

  /*
   * Resolve dependency
   */
  static resolve(container: DIContainer): WellKnownUrlsController {
    return container.resolve(WELL_KNOWN_URLS_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter
  ) {
    super(validator, logger, templater, router)

    this.logger.debug(`WellKnownUrlsController initialized`)
  }

  /*
   * Use middleware
   */
  use() {
    this.router.addMiddleware('well-known-urls', async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      await this.dispatchRoot[ctx.type](ctx, target, next)
    })
  }

  private dispatchRoot: WellKnownUrlsDispatchContextType = {
    normal: async (ctx, target, next) => {
      if (ctx.method.is('OPTIONS')) {
        await this.sendPreflightCors(ctx)
      } else if (ctx.url.isPath('/favicon.ico')) {
        await this.sendFaviconIco(ctx, target)
      } else if (ctx.url.isPath('/robots.txt')) {
        await this.sendRobotsTxt(ctx, target)
      } else if (ctx.url.isPath('/sitemap.xml')) {
        await this.sendSitemapXml(ctx, target)
      } else {
        await next()
      }
    },

    websocket: async (ctx, target, next) => {
      await next()
    },
  }
}
