import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerLocals,
  HttpServerRequest,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { addSchemas, validateSetupMirrorHeaders } from './setup-mirror.utils.js'
import { SETUP_MIRROR_USE_CASE, SetupMirrorUseCase } from './use-cases/index.js'

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
    super(validator, logger, 'setup-mirror')

    validator.addSchemas(addSchemas)

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): Promise<undefined> => {
    try {
      this.absentLocalsCampaign(locals)
      this.absentLocalsTarget(locals)

      const headers = {
        campaignId: request.headers['x-famir-campaign-id'],
        targetId: request.headers['x-famir-target-id']
      }

      validateSetupMirrorHeaders(this.assertSchema, headers)

      const { campaign, target } = await this.setupMirrorUseCase.execute({
        headers
      })

      locals.campaign = campaign
      locals.target = target

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', request)
    }
  }
}
