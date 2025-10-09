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
import {
  PREPARE_MESSAGE_REQUEST_USE_CASE,
  PrepareMessageRequestUseCase
} from './use-cases/index.js'

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
          c.resolve<PrepareMessageRequestUseCase>(PREPARE_MESSAGE_REQUEST_USE_CASE)
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
    protected readonly prepareMessageRequestUseCase: PrepareMessageRequestUseCase
  ) {
    super(validator, logger, 'build-request')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse | undefined> => {
    try {
      this.absentLocalsMessage(request.locals)
      this.existsLocalsCampaign(request.locals)
      this.existsLocalsTarget(request.locals)
      this.existsLocalsSession(request.locals)

      const { campaign, target, session } = request.locals

      const { message } = this.prepareMessageRequestUseCase.execute({
        campaign,
        target,
        session,
        request: {
          ip: request.ip,
          method: request.method,
          url: request.url,
          headers: request.headers,
          cookies: request.cookies,
          body: request.body
        }
      })

      request.locals.message = message

      return undefined
    } catch (error) {
      this.exceptionFilter(error, 'default', request)
    }
  }
}
