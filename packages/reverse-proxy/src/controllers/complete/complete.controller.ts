import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerShare,
  HttpServerRequest,
  HttpServerResponse,
  HttpServerRouter,
  Logger,
  LOGGER,
  Templater,
  TEMPLATER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { COMPLETE_USE_CASE, CompleteUseCase } from './use-cases/index.js'

export const COMPLETE_CONTROLLER = Symbol('CompleteController')

export class CompleteController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteController>(
      COMPLETE_CONTROLLER,
      (c) =>
        new CompleteController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<CompleteUseCase>(COMPLETE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): CompleteController {
    return container.resolve<CompleteController>(COMPLETE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter,
    protected readonly completeUseCase: CompleteUseCase
  ) {
    super(validator, logger, templater, 'complete')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (share: HttpServerShare): Promise<void> => {
    try {
      this.existsShareCampaign(share)
      this.existsShareProxy(share)
      this.existsShareTarget(share)
      this.existsShareSession(share)

      const { request, response, campaign, proxy, target, session } = share

      await this.completeUseCase.execute({
        request,
        response,
        campaign,
        proxy,
        target,
        session
      })
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}
