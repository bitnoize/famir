import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_LOG_QUEUE_NAME } from '@famir/workflow'
import {
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  RedisExecutorConnection
} from '../../executor-connector.js'
import { EXECUTOR_ROUTER, ExecutorRouter } from '../../executor-router.js'
import { BullExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'
import { ANALYZE_LOG_WORKER, AnalyzeLogWorker } from './analyze-log.js'

export class BullAnalyzeLogWorker extends BullBaseWorker implements AnalyzeLogWorker {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeLogWorker>(
      ANALYZE_LOG_WORKER,
      (c) =>
        new BullAnalyzeLogWorker(
          c.resolve<Config<BullExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR).connection<RedisExecutorConnection>(),
          c.resolve<ExecutorRouter>(EXECUTOR_ROUTER)
        )
    )
  }

  constructor(
    config: Config<BullExecutorConfig>,
    logger: Logger,
    connection: RedisExecutorConnection,
    router: ExecutorRouter
  ) {
    super(config, logger, connection, router, ANALYZE_LOG_QUEUE_NAME)
  }
}
