import { DIContainer } from '@famir/common'
import { CONSUME_ROUTER, ConsumeRouter } from '@famir/consume'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE_NAME } from '@famir/produce'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  READ_MESSAGE_USE_CASE,
  SAVE_MESSAGE_USE_CASE,
  type ReadMessageUseCase,
  type SaveMessageUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import { DUMMY_CONTROLLER } from './dummy.js'

export class DummyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      DUMMY_CONTROLLER,
      (c) =>
        new DummyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumeRouter>(CONSUME_ROUTER),
          c.resolve<ReadMessageUseCase>(READ_MESSAGE_USE_CASE),
          c.resolve<SaveMessageUseCase>(SAVE_MESSAGE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): DummyController {
    return container.resolve(DUMMY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ConsumeRouter,
    protected readonly readMessageUseCase: ReadMessageUseCase,
    protected readonly saveMessageUseCase: SaveMessageUseCase
  ) {
    super(validator, logger, router)

    this.logger.debug(`DummyController initialized`)
  }

  use() {
    this.router.addProcessor(ANALYZE_QUEUE_NAME, 'dummy', async (data) => {
      this.validateAnalyzeJobData(data)

      const message = await this.readMessageUseCase.execute(data)

      await this.saveMessageUseCase.execute(message)
    })
  }
}
