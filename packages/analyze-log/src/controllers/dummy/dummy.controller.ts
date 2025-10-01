import { AnalyzeLogJobResult, ExecutorDispatcher, Logger, Validator } from '@famir/domain'
import { validateAnalyzeLogJobData } from '../../analyze-log.utils.js'
import { DummyExampleUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'

export class DummyController extends BaseController {
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
