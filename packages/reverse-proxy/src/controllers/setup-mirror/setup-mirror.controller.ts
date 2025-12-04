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
import { SetupMirrorData } from './setup-mirror.js'
import { setupMirrorDataSchema } from './setup-mirror.schemas.js'
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
    super(validator, logger, router, 'setup-mirror')

    this.validator.addSchemas({
      'setup-mirror-data': setupMirrorDataSchema
    })

    this.router.addMiddleware(this.defaultMiddleware)
  }

  private defaultMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      if (this.isSetupMirrorState(ctx)) {
        await next()

        return
      }

      const data = {
        campaignId: ctx.originHeaders['x-famir-campaign-id'],
        targetId: ctx.originHeaders['x-famir-target-id']
      }

      this.validateSetupMirrorData(data)

      const { campaign, target, targets } = await this.setupMirrorService.execute(data)

      this.setSetupMirrorState(ctx, campaign, target, targets)

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
