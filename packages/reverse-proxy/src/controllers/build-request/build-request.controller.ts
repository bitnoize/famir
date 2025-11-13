import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
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
import { type GetTargetsUseCase, GET_TARGETS_USE_CASE } from './use-cases/index.js'

export const BUILD_REQUEST_CONTROLLER = Symbol('BuildRequestController')

export class BuildRequestController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildRequestController>(
      BUILD_REQUEST_CONTROLLER,
      (c) =>
        new BuildRequestController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<GetTargetsUseCase>(GET_TARGETS_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): BuildRequestController {
    return container.resolve<BuildRequestController>(BUILD_REQUEST_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly getTargetsUseCase: GetTargetsUseCase
  ) {
    super(validator, logger, templater, router, 'build-request')

    this.router.addMiddleware('build-request', this.prepareRequestMiddleware)
    this.router.addMiddleware('build-request', this.gatherStateMiddleware)
  }

  private prepareRequestMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)

      const { campaign } = ctx.state

      ctx.parseUrl()

      //ctx.loadRequestHeaders()

      await ctx.loadRequestBody(1024 * 1024 * 1024 * 10)

      await next()
    } catch (error) {
      this.handleException(error, 'default')
    }
  }

  private gatherStateMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      this.existsStateCampaign(ctx.state)
      this.absentStateTargets(ctx.state)

      const { campaign } = ctx.state

      const { targets } = await this.getTargetsUseCase.execute({
        campaignId: campaign.campaignId
      })

      ctx.state['targets'] = targets

      await next()
    } catch (error) {
      this.handleException(error, 'gatherState')
    }
  }
}
