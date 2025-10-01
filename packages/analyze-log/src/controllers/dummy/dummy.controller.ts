import { Logger, ExecutorDispatcher, Validator, AnalyzeLogJobResult } from '@famir/domain'
import { BaseController } from '../base/index.js'
import { DummyExampleUseCase } from '../../use-cases/index.js'
import { validateAnalyzeLogJobData } from '../../analyze-log.utils.js'

export class DummyController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    dispatcher: ExecutorDispatcher,
    dummyExampleUseCase: DummyExampleUseCase,
  ) {
    super(validator, logger, 'analyze')

    dispatcher.setHandler('example', this.exampleHandler)
  }

  private readonly exampleHandler = async (data: unknown): Promise<AnalyzeLogJobResult> => {
    try {
      validateAnalyzeLogJobData(this.assertSchema, data)

      await this.dummyExampleUseCase(data)
    } catch (error) {
      this.exceptionFilter(error, 'example', data)
    }
  }
}
