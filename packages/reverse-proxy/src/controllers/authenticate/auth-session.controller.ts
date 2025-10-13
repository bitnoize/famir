import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
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

export const AUTH_SESSION_CONTROLLER = Symbol('AuthSessionController')

export class AuthSessionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<AuthSessionController>(
      AUTH_SESSION_CONTROLLER,
      (c) =>
        new AuthSessionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): AuthSessionController {
    return container.resolve<AuthSessionController>(AUTH_SESSION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter
  ) {
    super(validator, logger, templater, 'auth-session')

    router.setHandler('all', '{*splat}', this.defaultHandler)
  }

  protected readonly defaultHandler = async (
    request: HttpServerRequest
  ): Promise<HttpServerResponse | undefined> => {
    try {
      return undefined
    } catch (error) {
      this.exceptionWrapper(error, 'default')
    }
  }
}
