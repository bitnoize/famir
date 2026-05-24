import { DIContainer } from '@famir/common'
import { type EnabledFullTargetModel, type FullCampaignModel } from '@famir/database'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerContextType,
  HttpServerError,
  HttpServerNextFunction,
  HttpServerRouter,
} from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type SetupMirrorService, SETUP_MIRROR_SERVICE } from './setup-mirror.service.js'

/**
 * DI token for the setup-mirror controller.
 *
 * @category SetupMirror
 */
export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

/**
 * @category SetupMirror
 * @internal
 */
type SetupMirrorHandler = (
  ctx: HttpServerContext,
  campaign: FullCampaignModel,
  target: EnabledFullTargetModel,
  message: HttpMessage,
  next: HttpServerNextFunction
) => Promise<void>

/**
 * @category SetupMirror
 * @internal
 */
type SetupMirrorDispatchContextType = Record<HttpServerContextType, SetupMirrorHandler>

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
   * @param router - The http-server router instance.
   * @param setupMirrorService - The setup-mirror service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly setupMirrorService: SetupMirrorService
  ) {
    super(validator, logger, templater, router)
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

      const message = HttpMessage.create(ctx.type)

      this.setState(ctx, 'campaign', campaign)
      this.setState(ctx, 'target', target)
      this.setState(ctx, 'targets', targets)
      this.setState(ctx, 'message', message)

      await this.dispatchRoot[ctx.type](ctx, campaign, target, message, next)
    })
  }

  private dispatchRoot: SetupMirrorDispatchContextType = {
    normal: async (ctx, campaign, target, message, next) => {
      if (ctx.state.verbose) {
        ctx.responseHeaders.merge({
          'X-Famir-Campaign-Id': target.campaignId,
          'X-Famir-Target-Id': target.targetId,
          'X-Famir-Message-Id': message.id,
        })
      }

      await next()
    },

    websocket: async (ctx, campaign, target, message, next) => {
      if (!target.allowWebSockets) {
        ctx.close()

        return
      }

      await next()
    },
  }

  private parseMirrorHost(ctx: HttpServerContext): string {
    try {
      const mirrorHost = ctx.requestHeaders.getString('Host')

      if (!(mirrorHost && /[^:]+:\d+$/.test(mirrorHost))) {
        throw new Error(`Host header malform`)
      }

      return mirrorHost
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }
}
