import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { ANALYZE_QUEUE_NAME } from '@famir/workflow'
import {
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  RedisExecutorConnection
} from '../../executor-connector.js'
import { EXECUTOR_ROUTER, ExecutorRouter } from '../../executor-router.js'
import { BullExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'
import { ANALYZE_WORKER, AnalyzeWorker } from './analyze.js'
import { analyzeSchemas } from './analyze.schemas.js'

export class BullAnalyzeWorker extends BullBaseWorker implements AnalyzeWorker {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeWorker>(
      ANALYZE_WORKER,
      (c) =>
        new BullAnalyzeWorker(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<BullExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR).connection<RedisExecutorConnection>(),
          c.resolve<ExecutorRouter>(EXECUTOR_ROUTER)
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<BullExecutorConfig>,
    logger: Logger,
    connection: RedisExecutorConnection,
    router: ExecutorRouter
  ) {
    super(validator, config, logger, connection, router, ANALYZE_QUEUE_NAME)

    this.validator.addSchemas(analyzeSchemas)

    this.logger.debug(`AnalyzeWorker initialized`)
  }
}
