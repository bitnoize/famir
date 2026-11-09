import { DIContainer } from '@famir/common'
import { Logger, LOGGER, TEMPLATER, Templater, Validator, VALIDATOR } from '@famir/domain'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  type HttpServerAssets,
  type HttpServerRouter,
} from '@famir/http-server'
import {
  BaseController,
  ReverseDispatchContextType,
  ReverseDispatchTargetLabel,
} from '../base/index.js'

/**
 * DI token for the well-known controller.
 *
 * @category WellKnown
 */
export const WELL_KNOWN_CONTROLLER = Symbol('WellKnownController')

/**
 * Represents the well-known controller.
 *
 * @category WellKnown
 */
export class WellKnownController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<WellKnownController>(
      WELL_KNOWN_CONTROLLER,
      (c) =>
        new this(
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
    return container.resolve<WellKnownController>(WELL_KNOWN_CONTROLLER)
  }

  init(): this {
    return this
  }

  main(): this {
    this.router.add('well-known-main', async (ctx, next) => {
      await this.dispatchMain[ctx.type](ctx, next)
    })

    return this
  }

  hook(): this {
    this.router.add('well-known-hook', async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      if (!target.label) {
        await next()

        return
      }

      const hook = this.dispatchHook[target.label]

      if (hook) {
        await hook(ctx, next)
      } else {
        this.logger.warn(`Controller dispatch hook not found`, {
          controller: 'well-known',
          targetLabel: target.label,
        })

        await next()
      }
    })

    return this
  }

  protected dispatchMain: ReverseDispatchContextType = {
    normal: async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      if (!target.hasFlag('no-preflight-cors') && ctx.method.is('OPTIONS')) {
        await this.sendPreflightCors(ctx)
      } else if (!target.hasFlag('no-favicon-ico') && ctx.url.isPath('/favicon.ico')) {
        await this.sendFaviconIco(ctx, target)
      } else if (!target.hasFlag('no-robots-txt') && ctx.url.isPath('/robots.txt')) {
        await this.sendRobotsTxt(ctx, target)
      } else if (!target.hasFlag('no-sitemap-xml') && ctx.url.isPath('/sitemap.xml')) {
        await this.sendSitemapXml(ctx, target)
      } else {
        await next()
      }
    },

    websocket: async (ctx, next) => {
      await next()
    },
  }

  protected dispatchHook: ReverseDispatchTargetLabel = {}
}
