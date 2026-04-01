import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { ReadSessionData, SESSION_SERVICE, type SessionService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { SESSION_CONTROLLER } from './session.js'
import { sessionSchemas } from './session.schemas.js'

/*
 * Session controller
 */
export class SessionController extends BaseController {
  /*
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

  /*
   * Resolve dependency
   */
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

  /*
   * Use api-calls
   */
  use() {
    this.router.addApiCall('readSession', async (data) => {
      this.validateData<ReadSessionData>('console-read-session-data', data)

      return await this.sessionService.read(data)
    })
  }
}
