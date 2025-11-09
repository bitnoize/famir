import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_REGISTRY,
  HttpServerState,
  HttpServerContext,
  HttpServerRegistry,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { CAMPAIGN_SERVICE, CampaignService } from '../../services/index.js'

export const PREPARE_CONTROLLER = Symbol('PrepareController')

export class PrepareController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<PrepareController>(
      PREPARE_CONTROLLER,
      (c) =>
        new PrepareController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRegistry>(HTTP_SERVER_REGISTRY),
          c.resolve<CampaignService>(CAMPAIGN_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): PrepareController {
    return container.resolve<PrepareController>(PREPARE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    registry: HttpServerRegistry,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, templater, 'prepare')

    registry.addMiddleware('prepare', this.loadRequestBodyMiddleware)
    registry.addMiddleware('prepare', this.loadTargetsMiddleware)
  }

  private readonly loadRequestBodyMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      await ctx.loadRequestBody()

      await next()
    } catch (error) {
      this.handleException(error, 'prepare', 'loadRequestBodyMiddleware')
    }
  }

  private readonly loadTargetsMiddleware: HttpServerMiddleware = async (ctx, next) => {
    try {
      absentStateTargets(ctx.state)

      const { targets } = await this.databaseService.listTargets({
        campaign,
      })

      ctx.state.targets = targets

      await next()
    } catch (error) {
      this.handleException(error, 'prepare', 'loadTargetsMiddleware')
    }
  }

  private readonly prepareMiddleware = async (
    ctx: HttpServerContext,
    next: HttpServerNextFunction
  ): Promise<void> => {
    try {
      this.absentShareProxy(share)
      this.absentShareTargets(share)

      this.existsShareCampaign(share)
      this.existsShareTarget(share)
      this.existsShareSession(share)

      const { request, campaign, target, session } = share

      request.headers['host'] = undefined
      request.headers['cookie'] = undefined

      const { targets } = await this.buildRequestUseCase.execute({
        campaign,
      })

      share.targets = targets

      await next()
    } catch (error) {
      this.handleException(error, 'prepare', 'default')
    }
  }
}
