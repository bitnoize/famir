import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ReadSessionData, SESSION_CONTROLLER, SESSION_SERVICE } from './session.js'
import { sessionSchemas } from './session.schemas.js'
import { type SessionService } from './session.service.js'

/**
 * Represents a session controller
 *
 * @category Session
 */
export class SessionController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
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

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): SessionController {
    return container.resolve<SessionService>(SESSION_CONTROLLER)
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

  use() {
    this.router.addApiCall('readSession', async (data) => {
      this.validateData<ReadSessionData>('console-read-session-data', data)

      return await this.sessionService.read(data)
    })
  }
}
