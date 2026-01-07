import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerContext,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { SetupMirrorData } from './setup-mirror.js'
import { setupMirrorSchemas } from './setup-mirror.schemas.js'
import { type SetupMirrorService, SETUP_MIRROR_SERVICE } from './setup-mirror.service.js'

export const SETUP_MIRROR_CONTROLLER = Symbol('SetupMirrorController')

export class SetupMirrorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<SetupMirrorController>(
      SETUP_MIRROR_CONTROLLER,
      (c) =>
        new SetupMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<SetupMirrorService>(SETUP_MIRROR_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): SetupMirrorController {
    return container.resolve<SetupMirrorController>(SETUP_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly setupMirrorService: SetupMirrorService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(setupMirrorSchemas)

    this.router.register('setupMirror', this.setupMirror)
  }

  protected setupMirror: HttpServerMiddleware = async (ctx, next) => {
    const setupMirrorData = this.parseSetupMirrorData(ctx)

    const [campaign, target] = await this.setupMirrorService.readCampaignTarget({
      campaignId: setupMirrorData.campaign_id,
      targetId: setupMirrorData.target_id
    })

    const targets = await this.setupMirrorService.listTargets({
      campaignId: setupMirrorData.campaign_id
    })

    this.setState(ctx, 'campaign', campaign)
    this.setState(ctx, 'target', target)
    this.setState(ctx, 'targets', targets)

    await next()
  }

  protected parseSetupMirrorData(ctx: HttpServerContext): SetupMirrorData {
    try {
      const data = {
        campaign_id: ctx.getRequestHeader('X-Famir-Campaign-Id'),
        target_id: ctx.getRequestHeader('X-Famir-Target-Id')
      }

      this.validator.assertSchema<SetupMirrorData>('reverse-proxy-setup-mirror-data', data)

      return data
    } catch (error) {
      throw new HttpServerError(`SetupMirrorData validate failed`, {
        cause: error,
        code: 'SERVICE_UNAVAILABLE'
      })
    }
  }
}
