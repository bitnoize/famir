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
import { DEFAULT_CONTROLLER } from './default.js'

/*
 * Default controller
 */
export class DefaultController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      DEFAULT_CONTROLLER,
      (c) =>
        new DefaultController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumeRouter>(CONSUME_ROUTER),
          c.resolve<ReadMessageUseCase>(READ_MESSAGE_USE_CASE),
          c.resolve<SaveMessageUseCase>(SAVE_MESSAGE_USE_CASE)
        )
    )
  }

  /*
   * Resolve dependency
   */
  static resolve(container: DIContainer): DefaultController {
    return container.resolve(DEFAULT_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ConsumeRouter,
    protected readonly readMessageUseCase: ReadMessageUseCase,
    protected readonly saveMessageUseCase: SaveMessageUseCase
  ) {
    super(validator, logger, router)

    this.logger.debug(`DefaultController initialized`)
  }

  /*
   * Use processor
   */
  use() {
    this.router.addProcessor(ANALYZE_QUEUE_NAME, 'default', async (data) => {
      this.validateAnalyzeJobData(data)

      const message = await this.readMessageUseCase.execute(data)

      await this.saveMessageUseCase.execute(message)
    })
  }
}
