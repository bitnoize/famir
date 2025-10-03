import { DIContainer } from '@famir/common'
import { AnalyzeLogJobResult, ExecutorDispatcher, Logger, Validator } from '@famir/domain'
import { validateAnalyzeLogJobData } from '../../analyze-log.utils.js'
import { DummyExampleUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'

export class DummyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyController>(
      'DummyController',
      (c) =>
        new DummyController(
          c.resolve<Validator>('Validator'),
          c.resolve<Logger>('Logger'),
          c.resolve<ExecutorDispatcher>('ExecutorDispatcher'),
          c.resolve<DummyExampleUseCase>('DummyExampleUseCase')
        )
    )
  }

  static resolve(container: DIContainer): DummyController {
    return container.resolve<DummyController>('DummyController')
  }

  constructor(
    validator: Validator,
    logger: Logger,
    dispatcher: ExecutorDispatcher,
    protected readonly dummyExampleUseCase: DummyExampleUseCase
  ) {
    super(validator, logger, 'analyze')

    dispatcher.setHandler('example', this.exampleHandler)
  }

  private readonly exampleHandler = async (data: unknown): Promise<AnalyzeLogJobResult> => {
    try {
      validateAnalyzeLogJobData(this.assertSchema, data)

      return await this.dummyExampleUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'example', data)
    }
  }
}
