import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerApiCall, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ReadSessionData } from './session.js'
import { sessionSchemas } from './session.schemas.js'
import { SESSION_SERVICE, type SessionService } from './session.service.js'

export const SESSION_CONTROLLER = Symbol('SessionController')

export class SessionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      SESSION_CONTROLLER,
      (c) =>
        new SessionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<SessionService>(SESSION_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): SessionController {
    return container.resolve(SESSION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly sessionService: SessionService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(sessionSchemas)

    this.logger.debug(`SessionController initialized`)
  }

  register(): this {
    this.router.register('readSession', this.readSessionApiCall)

    return this
  }

  private readSessionApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ReadSessionData>('console-read-session-data', data)

    return await this.sessionService.read(data)
  }
}
