import { DIContainer } from '@famir/common'
import { type EnabledFullTargetModel } from '@famir/database'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerContext,
  HttpServerContextType,
  HttpServerNextFunction,
  HttpServerRouter,
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'

/**
 * DI token for the well-known-urls controller.
 *
 * @category WellKnownUrls
 */
export const WELL_KNOWN_URLS_CONTROLLER = Symbol('WellKnownUrlsController')

/**
 * @category WellKnownUrls
 * @internal
 */
type WellKnownUrlsHandler = (
  ctx: HttpServerContext,
  target: EnabledFullTargetModel,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category WellKnownUrls
 * @internal
 */
type WellKnownUrlsDispatchContextType = Record<HttpServerContextType, WellKnownUrlsHandler>

/**
 * Represents the well-known-urls controller.
 *
 * @category WellKnownUrls
 */
export class WellKnownUrlsController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<WellKnownUrlsController>(
      WELL_KNOWN_URLS_CONTROLLER,
      (c) =>
        new WellKnownUrlsController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<WellKnownUrlsController>(WELL_KNOWN_URLS_CONTROLLER)
  }

  /**
   * Registers used middleware in the router.
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
