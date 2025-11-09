import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerRegistry,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { SESSION_SERVICE, SessionService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { addSchemas, validateReadSessionModel } from './session.utils.js'

export const SESSION_CONTROLLER = Symbol('SessionController')

export class SessionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionController>(
      SESSION_CONTROLLER,
      (c) =>
        new SessionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
          c.resolve<SessionService>(SESSION_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): SessionController {
    return container.resolve<SessionController>(SESSION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    registry: ReplServerRegistry,
    protected readonly sessionService: SessionService
  ) {
    super(validator, logger, 'session')

    validator.addSchemas(addSchemas)

    registry.addApiCall('readSession', this.readSessionApiCall)

    this.logger.debug(`SessionController initialized`)
  }

  private readonly readSessionApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadSessionModel(this.assertSchema, data)

      return await this.sessionService.read(data)
    } catch (error) {
      this.handleException(error, 'readSession', data)
    }
  }
}
