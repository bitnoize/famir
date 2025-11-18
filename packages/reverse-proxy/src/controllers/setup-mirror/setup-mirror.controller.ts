import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerError,
  HttpServerMiddleware,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { setupMirrorDataSchema } from './setup-mirror.schemas.js'
import {
  type SetupMirrorUseCase,
  SETUP_MIRROR_USE_CASE,
  SetupMirrorData
} from './use-cases/index.js'

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
          c.resolve<SetupMirrorUseCase>(SETUP_MIRROR_USE_CASE)
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
    protected readonly setupMirrorUseCase: SetupMirrorUseCase
  ) {
    super(validator, logger, router, 'setup-mirror')

    this.validator.addSchemas({
      'setup-mirror-data': setupMirrorDataSchema
    })

    this.router.addMiddleware('setup-mirror', this.defaultMiddleware)

    this.logger.debug(`Controller initialized`, {
      controllerName: this.controllerName
    })
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.absentStateCampaign(ctx.state)
      this.absentStateTarget(ctx.state)
      this.absentStateTargets(ctx.state)

      const data = {
        campaignId: ctx.requestHeaders['x-famir-campaign-id'],
        targetId: ctx.requestHeaders['x-famir-target-id']
      }

      this.validateSetupMirrorData(data)

      const { campaign, target, targets } = await this.setupMirrorUseCase.execute(data)

      ctx.state.campaign = campaign
      ctx.state.target = target
      ctx.state.targets = targets

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }

  private validateSetupMirrorData(value: unknown): asserts value is SetupMirrorData {
    try {
      this.validator.assertSchema<SetupMirrorData>('setup-mirror-data', value)
    } catch (error) {
      throw new HttpServerError(`SetupMirrorData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
