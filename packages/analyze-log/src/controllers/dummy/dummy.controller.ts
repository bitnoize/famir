import { DIContainer } from '@famir/common'
import {
  AnalyzeLogJobResult,
  EXECUTOR_REGISTRY,
  ExecutorRegistry,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { validateAnalyzeLogJobData } from '../../analyze-log.utils.js'
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
          c.resolve<ExecutorRegistry>(EXECUTOR_REGISTRY),
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
    registry: ExecutorRegistry,
    protected readonly dummyUseCase: DummyUseCase
  ) {
    super(validator, logger, 'analyze')

    registry.addProcessor('example', this.exampleHandler)
  }

  private readonly exampleHandler = async (data: unknown): Promise<AnalyzeLogJobResult> => {
    try {
      validateAnalyzeLogJobData(this.assertSchema, data)

      return await this.dummyUseCase.execute(data)
    } catch (error) {
      this.exceptionWrapper(error, 'example')
    }
  }
}
