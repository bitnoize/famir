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
import { BaseController } from '../base/index.js'
import { addSchemas, validateReadSessionModel } from './session.utils.js'
import { READ_SESSION_USE_CASE, ReadSessionUseCase } from './use-cases/index.js'

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

    validator.addSchemas(addSchemas)

    context.setHandler('readSession', this.readSessionHandler)
  }

  private readonly readSessionHandler = async (data: unknown): Promise<SessionModel> => {
    try {
      validateReadSessionModel(this.assertSchema, data)

      return await this.readSessionUseCase.execute(data)
    } catch (error) {
      this.exceptionWrapper(error, 'readSession')
    }
  }
}
