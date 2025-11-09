import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerShare,
  HttpServerRequest,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
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
          c.resolve<Templater>(TEMPLATER),
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
    templater: Templater,
    router: HttpServerRouter,
    protected readonly setupMirrorUseCase: SetupMirrorUseCase
  ) {
    super(validator, logger, templater, 'setup-mirror')

    validator.addSchemas(addSchemas)

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (share: HttpServerShare): Promise<void> => {
    try {
      this.absentShareCampaign(share)
      this.absentShareTarget(share)

      const { request } = share

      const setupHeaders = {
        campaignId: request.headers['x-famir-campaign-id'],
        targetId: request.headers['x-famir-target-id']
      }

      validateSetupMirrorHeaders(this.assertSchema, setupHeaders)

      request.headers['x-famir-campaign-id'] = undefined
      request.headers['x-famir-target-id'] = undefined

      const { campaign, target } = await this.setupMirrorUseCase.execute({
        setupHeaders
      })

      share.campaign = campaign
      share.target = target
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}
