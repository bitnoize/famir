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
import { SetupMirrorHeaders } from './setup-mirror.js'
import { setupMirrorHeadersSchema } from './setup-mirror.schemas.js'
import { type GetTargetUseCase, GET_TARGET_USE_CASE } from './use-cases/index.js'

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
          c.resolve<GetTargetUseCase>(GET_TARGET_USE_CASE)
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
    protected readonly getTargetUseCase: GetTargetUseCase
  ) {
    super(validator, logger, router, 'setup-mirror')

    this.validator.addSchemas({
      'setup-mirror-headers': setupMirrorHeadersSchema
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

      const setupHeaders = {
        campaignId: ctx.originRequestHeaders['x-famir-campaign-id'],
        targetId: ctx.originRequestHeaders['x-famir-target-id']
      }

      this.validateSetupMirrorHeaders(setupHeaders)

      const { campaign, target } = await this.getTargetUseCase.execute({
        campaignId: setupHeaders.campaignId,
        targetId: setupHeaders.targetId
      })

      ctx.state.campaign = campaign
      ctx.state.target = target

      await next()
    } catch (error) {
      this.handleException(error, 'default')
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
