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
} from '../../consume.js'
import { BullBaseWorker } from '../base/index.js'
import { ANALYZE_WORKER, AnalyzeWorker } from './analyze.js'

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
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(CONSUME_CONNECTOR),
          c.resolve(CONSUME_ROUTER)
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<BullConsumeConfig>,
    logger: Logger,
    connector: ConsumeConnector,
    router: ConsumeRouter
  ) {
    super(validator, config, logger, connector, router, ANALYZE_QUEUE_NAME)

    this.logger.debug(`AnalyzeWorker initialized`)
  }
}
