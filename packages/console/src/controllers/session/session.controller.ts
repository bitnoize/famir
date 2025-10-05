import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  SessionModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { READ_SESSION_USE_CASE, ReadSessionUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { validateReadSessionData } from './session.utils.js'

export const SESSION_CONTROLLER = Symbol('SessionController')

export class SessionController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionController>(
      SESSION_CONTROLLER,
      (c) =>
        new SessionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<ReadSessionUseCase>(READ_SESSION_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): SessionController {
    return container.resolve<SessionController>(SESSION_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly readSessionUseCase: ReadSessionUseCase
  ) {
    super(validator, logger, 'session')

    context.setHandler('readSession', this.readSessionHandler)
  }

  private readonly readSessionHandler = async (data: unknown): Promise<SessionModel | null> => {
    try {
      validateReadSessionData(this.assertSchema, data)

      return await this.readSessionUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readSession', data)
    }
  }
}
