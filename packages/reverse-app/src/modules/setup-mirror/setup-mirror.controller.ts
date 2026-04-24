import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter,
} from '@famir/http-server'
import { HttpMessage } from '@famir/http-tools'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  SETUP_MIRROR_CONTROLLER,
  SETUP_MIRROR_SERVICE,
  SetupMirrorDispatchContextType,
} from './setup-mirror.js'
import { type SetupMirrorService } from './setup-mirror.service.js'

/**
 * Represents a setup-mirror controller
 *
 * @category SetupMirror
 */
export class SetupMirrorController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<SetupMirrorController>(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(TEMPLATER),
          c.resolve(HTTP_SERVER_ROUTER),
          c.resolve(SETUP_MIRROR_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): SetupMirrorController {
    return container.resolve(SETUP_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly setupMirrorService: SetupMirrorService
  ) {
    super(validator, logger, templater, router)

    this.logger.debug(`SetupMirrorController initialized`)
  }

  use() {
    this.router.addMiddleware('setup-mirror', async (ctx, next) => {
      const mirrorHost = this.parseMirrorHost(ctx)

      const [campaignShare, campaign, target, targets] = await this.setupMirrorService.findTarget({
        mirrorHost,
      })

      const message = HttpMessage.create(ctx.type)

      this.setState(ctx, 'campaignShare', campaignShare)
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
