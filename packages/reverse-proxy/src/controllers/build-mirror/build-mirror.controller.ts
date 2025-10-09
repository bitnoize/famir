import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { addSchemas, validateReadCampaignTargetData } from './build-mirror.utils.js'
import { READ_CAMPAIGN_TARGET_USE_CASE, ReadCampaignTargetUseCase } from './use-cases/index.js'

export const BUILD_MIRROR_CONTROLLER = Symbol('BuildMirrorController')

export class BuildMirrorController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildMirrorController>(
      BUILD_MIRROR_CONTROLLER,
      (c) =>
        new BuildMirrorController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<ReadCampaignTargetUseCase>(READ_CAMPAIGN_TARGET_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): BuildMirrorController {
    return container.resolve<BuildMirrorController>(BUILD_MIRROR_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly readCampaignTargetUseCase: ReadCampaignTargetUseCase
  ) {
    super(validator, logger, 'build-mirror')

    validator.addSchemas(addSchemas)

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse | undefined> => {
    try {
      this.absentLocalsCampaign(request.locals)
      this.absentLocalsTarget(request.locals)

      const data = {
        campaignId: request.headers['x-famir-campaign-id'],
        targetId: request.headers['x-famir-target-id']
      }

      validateReadCampaignTargetData(this.assertSchema, data)

      const { campaign, target } = await this.readCampaignTargetUseCase.execute(data)

      request.locals.campaign = campaign
      request.locals.target = target

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', request)
    }
  }
}
