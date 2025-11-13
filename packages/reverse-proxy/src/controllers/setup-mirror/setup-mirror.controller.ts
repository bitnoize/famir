import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { SetupMirrorHeaders } from './setup-mirror.js'
import { setupMirrorHeadersSchema } from './setup-mirror.schemas.js'
import { type GetCampaignTargetUseCase, GET_CAMPAIGN_TARGET_USE_CASE } from './use-cases/index.js'

export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

export class SetupMirrorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<SetupMirrorController>(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<GetCampaignTargetUseCase>(GET_CAMPAIGN_TARGET_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): SetupMirrorController {
    return container.resolve<SetupMirrorController>(SETUP_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly getCampaignTargetUseCase: GetCampaignTargetUseCase
  ) {
    super(validator, logger, templater, router, 'setup-mirror')

    this.validator.addSchemas({
      'setup-mirror-headers': setupMirrorHeadersSchema
    })

    this.router.addMiddleware('setup-mirror', this.gatherStateMiddleware)
  }

  private gatherStateMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.absentStateCampaign(ctx.state)
      this.absentStateTarget(ctx.state)

      const setupHeaders = {
        campaignId: ctx.originRequestHeaders['x-famir-campaign-id'],
        targetId: ctx.originRequestHeaders['x-famir-target-id']
      }

      this.validateSetupMirrorHeaders(setupHeaders)

      const { campaign, target } = await this.getCampaignTargetUseCase.execute({
        campaignId: setupHeaders.campaignId,
        targetId: setupHeaders.targetId
      })

      ctx.state.campaign = campaign
      ctx.state.target = target

      await next()
    } catch (error) {
      this.handleException(error, 'gatherState')
    }
  }

  private validateSetupMirrorHeaders(value: unknown): asserts value is SetupMirrorHeaders {
    try {
      this.validator.assertSchema<SetupMirrorHeaders>('setup-mirror-headers', value)
    } catch (error) {
      throw new HttpServerError(`SetupMirrorHeaders validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
