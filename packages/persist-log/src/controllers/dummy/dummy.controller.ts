import { DIContainer } from '@famir/common'
import {
  EXECUTOR_DISPATCHER,
  ExecutorDispatcher,
  Logger,
  LOGGER,
  PersistLogJobResult,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { validatePersistLogJobData } from '../../persist-log.utils.js'
import { BaseController } from '../base/index.js'
import { DUMMY_USE_CASE, DummyUseCase } from './use-cases/index.js'

export const DUMMY_CONTROLLER = Symbol('DummyController')

export class DummyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyController>(
      DUMMY_CONTROLLER,
      (c) =>
        new DummyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorDispatcher>(EXECUTOR_DISPATCHER),
          c.resolve<DummyUseCase>(DUMMY_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): DummyController {
    return container.resolve<DummyController>(DUMMY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    dispatcher: ExecutorDispatcher,
    protected readonly dummyUseCase: DummyUseCase
  ) {
    super(validator, logger, 'dummy')

    dispatcher.setHandler('default', this.defaultHandler)
  }

  private readonly defaultHandler = async (data: unknown): Promise<PersistLogJobResult> => {
    try {
      validatePersistLogJobData(this.assertSchema, data)

      return await this.dummyUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'default', data)
    }
  }
}
