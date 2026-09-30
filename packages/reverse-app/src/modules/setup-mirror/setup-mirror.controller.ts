import { DIContainer } from '@famir/common'
import {
  HttpServerError,
  Logger,
  LOGGER,
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  type HttpServerAssets,
  type HttpServerContext,
  HttpServerContextType,
  HttpServerMiddleware,
  type HttpServerRouter,
} from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { BaseController } from '../base/index.js'
import { SETUP_MIRROR_SERVICE, type SetupMirrorService } from './setup-mirror.service.js'

/**
 * DI token for the setup-mirror controller.
 *
 * @category SetupMirror
 */
export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

/**
 * Represents the setup-mirror controller.
 *
 * @category SetupMirror
 */
export class SetupMirrorController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SetupMirrorController>(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<SetupMirrorService>(SETUP_MIRROR_SERVICE)
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
    return container.resolve<SetupMirrorController>(SETUP_MIRROR_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param setupMirrorService - The setup-mirror service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: HttpServerAssets,
    router: HttpServerRouter,
    protected readonly setupMirrorService: SetupMirrorService
  ) {
    super(validator, logger, templater, assets, router)
  }

  /**
   * Registers used middleware in the router.
   */
  use() {
    this.router.addMiddleware('setup-mirror', async (ctx, next) => {
      const mirrorHost = this.parseMirrorHost(ctx)

      const target = await this.setupMirrorService.findTarget({
        mirrorHost,
      })

      const campaign = await this.setupMirrorService.readCampaign({
        campaignId: target.campaignId,
      })

      const targets = await this.setupMirrorService.listTargets({
        campaignId: target.campaignId,
      })

      this.setState(ctx, 'campaign', campaign)
      this.setState(ctx, 'target', target)
      this.setState(ctx, 'targets', targets)

      const message = HttpMessage.create(ctx.type)

      this.setState(ctx, 'message', message)

      await this.dispatchUse[ctx.type](ctx, next)
    })
  }

  private dispatchUse: Record<HttpServerContextType, HttpServerMiddleware> = {
    normal: async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      if (campaign.hasFlag('verbose')) {
        ctx.responseHeaders.merge({
          'X-Famir-Campaign-Id': target.campaignId,
          'X-Famir-Target-Id': target.targetId,
          'X-Famir-Message-Id': message.id,
        })
      }

      await next()
    },

    websocket: async (ctx, next) => {
      const target = this.getState(ctx, 'target')

      if (!target.allowWebSockets) {
        ctx.close()

        return
      }

      await next()
    },
  }

  private parseMirrorHost(ctx: HttpServerContext): string {
    try {
      const rawProto = ctx.requestHeaders.getString('X-Forwarded-Proto')
      if (!rawProto) {
        throw new Error(`Missing 'X-Forwarded-Proto' header`)
      }

      const rawHost = ctx.requestHeaders.getString('X-Forwarded-Host')
      if (!rawHost) {
        throw new Error(`Missing 'X-Forwarded-Host' header`)
      }

      const url = new URL(`${rawProto}://${rawHost}`)

      const defaultPort = url.protocol === 'https:' ? '443' : '80'
      const mirrorHost = `${url.hostname}:${url.port || defaultPort}`

      if (!/^[^:]+:\d+$/.test(mirrorHost)) {
        throw new Error(`Malform mirror-host string`)
      }

      return mirrorHost
    } catch (error) {
      throw HttpServerError.badRequest(`Bad request`, null, error)
    }
  }
}
