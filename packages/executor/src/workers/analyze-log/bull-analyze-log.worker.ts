import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE_NAME,
  ANALYZE_LOG_WORKER,
  AnalyzeLogWorker,
  Config,
  CONFIG,
  EXECUTOR_CONNECTOR,
  EXECUTOR_ROUTER,
  ExecutorConnector,
  ExecutorRouter,
  Logger,
  LOGGER
} from '@famir/domain'
import { BullExecutorConfig } from '../../executor.js'
import { RedisExecutorConnection } from '../../redis-executor-connector.js'
import { BullBaseWorker } from '../base/index.js'

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
