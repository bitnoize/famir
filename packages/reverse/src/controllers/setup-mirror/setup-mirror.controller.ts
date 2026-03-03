import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter
} from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { ReverseMessage } from '../../reverse-message.js'
import {
  type FindCampaignTargetUseCase,
  FIND_CAMPAIGN_TARGET_USE_CASE
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'

export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

export class SetupMirrorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<FindCampaignTargetUseCase>(FIND_CAMPAIGN_TARGET_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): SetupMirrorController {
    return container.resolve(SETUP_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly findCampaignTargetUseCase: FindCampaignTargetUseCase
  ) {
    super(validator, logger, router)

    this.logger.debug(`SetupMirrorController initialized`)
  }

  use(): this {
    this.router.register('setup-mirror', async (ctx, next) => {
      const mirrorHost = this.parseMirrorHost(ctx)

      const [campaign, target, targets] = await this.findCampaignTargetUseCase.execute({
        mirrorHost
      })

      const message = new ReverseMessage(
        ctx.method,
        ctx.url.clone(),
        ctx.requestHeaders.clone().reset(),
        ctx.requestBody.clone().reset(),
        ctx.status.clone().reset(),
        ctx.responseHeaders.clone().reset(),
        ctx.responseBody.clone().reset()
      )

      this.setState(ctx, 'campaign', campaign)
      this.setState(ctx, 'target', target)
      this.setState(ctx, 'targets', targets)
      this.setState(ctx, 'message', message)

      if (ctx.verbose) {
        ctx.responseHeaders.merge({
          'X-Famir-Campaign-Id': target.campaignId,
          'X-Famir-Target-Id': target.targetId,
          'X-Famir-Message-Id': message.id
        })
      }

      await next()
    })

    return this
  }

  private parseMirrorHost(ctx: HttpServerContext): string {
    try {
      const mirrorHost = ctx.requestHeaders.getString('Host')

      if (!(mirrorHost && /[^:]+:\d+$/.test(mirrorHost))) {
        throw new Error(`MirrorHost header malform`)
      }

      return mirrorHost
    } catch (error) {
      throw new HttpServerError(`Bad request`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
