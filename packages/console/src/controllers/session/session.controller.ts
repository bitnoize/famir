import { DIContainer } from '@famir/common'
import { readSessionDataSchema } from '@famir/database'
import {
  Logger,
  LOGGER,
  ReadSessionData,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { SESSION_SERVICE, type SessionService } from './session.service.js'

export class SessionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionController>(
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
    return container.resolve<SessionController>(SESSION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly sessionService: SessionService
  ) {
    super(validator, logger, router, 'session')

    this.validator.addSchemas({
      'console-read-session-data': readSessionDataSchema
    })

    this.router.addApiCall('readSession', this.readSessionApiCall)
  }

  private readSessionApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadSessionData(data)

      return await this.sessionService.readSession(data)
    } catch (error) {
      this.handleException(error, 'readSession', data)
    }
  }

  private validateReadSessionData(value: unknown): asserts value is ReadSessionData {
    try {
      this.validator.assertSchema<ReadSessionData>('console-read-session-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadSessionData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

export const SESSION_CONTROLLER = Symbol('SessionController')
