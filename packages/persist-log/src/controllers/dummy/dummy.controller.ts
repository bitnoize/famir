import { ExecutorDispatcher, Logger, PersistLogJobResult, Validator } from '@famir/domain'
import { validatePersistLogJobData } from '../../persist-log.utils.js'
import { DummyUseCase } from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'

export class DummyController extends BaseController {
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
