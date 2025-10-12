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
import { BUILD_REQUEST_USE_CASE, BuildRequestUseCase } from './use-cases/index.js'

export const BUILD_REQUEST_CONTROLLER = Symbol('BuildRequestController')

export class BuildRequestController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildRequestController>(
      BUILD_REQUEST_CONTROLLER,
      (c) =>
        new BuildRequestController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<BuildRequestUseCase>(BUILD_REQUEST_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): BuildRequestController {
    return container.resolve<BuildRequestController>(BUILD_REQUEST_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: HttpServerRouter,
    protected readonly buildRequestUseCase: BuildRequestUseCase
  ) {
    super(validator, logger, 'build-request')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest,
    locals: HttpServerLocals
  ): Promise<undefined> => {
    try {
      this.absentLocalsTargets(locals)
      this.absentLocalsCreateMessage(locals)

      this.existsLocalsCampaign(locals)
      this.existsLocalsProxy(locals)
      this.existsLocalsTarget(locals)
      this.existsLocalsSession(locals)

      const { campaign, proxy, target, session } = locals

      const { targets, createMessage } = await this.buildRequestUseCase.execute({
        campaign,
        proxy,
        target,
        session,
        request
      })

      locals.targets = targets
      locals.createMessage = createMessage

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', request)
    }
  }
}
