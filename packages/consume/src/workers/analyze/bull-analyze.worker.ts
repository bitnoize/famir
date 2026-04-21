import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE_NAME } from '@famir/produce'
import { Validator, VALIDATOR } from '@famir/validator'
import { ConsumeRouter } from '../../consume-router.js'
import {
  BullConsumeConfig,
  CONSUME_CONNECTOR,
  CONSUME_ROUTER,
  ConsumeConnector,
  RedisConsumeConnection,
} from '../../consume.js'
import { BullBaseWorker } from '../base/index.js'
import { ANALYZE_WORKER, AnalyzeWorker } from './analyze.js'
import { analyzeSchemas } from './analyze.schemas.js'

/**
 * Bull analyze worker implementation
 *
 * @category Analyze
 */
export class BullAnalyzeWorker extends BullBaseWorker implements AnalyzeWorker {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeWorker>(
      ANALYZE_WORKER,
      (c) =>
        new BullAnalyzeWorker(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<BullConsumeConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumeConnector>(CONSUME_CONNECTOR).getConnection<RedisConsumeConnection>(),
          c.resolve<ConsumeRouter>(CONSUME_ROUTER)
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<BullConsumeConfig>,
    logger: Logger,
    connection: RedisConsumeConnection,
    router: ConsumeRouter
  ) {
    super(validator, config, logger, connection, router, ANALYZE_QUEUE_NAME)

    this.validator.addSchemas(analyzeSchemas)

    this.logger.debug(`AnalyzeWorker initialized`)
  }
}
