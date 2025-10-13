import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE_NAME,
  ANALYZE_LOG_WORKER,
  AnalyzeLogWorker,
  Config,
  CONFIG,
  EXECUTOR_CONNECTOR,
  EXECUTOR_DISPATCHER,
  ExecutorConnector,
  ExecutorDispatcher,
  Logger,
  LOGGER
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullAnalyzeLogWorker extends BullBaseWorker implements AnalyzeLogWorker {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeLogWorker>(
      ANALYZE_LOG_WORKER,
      (c) =>
        new BullAnalyzeLogWorker(
          c.resolve<Config<ExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR).connection<BullExecutorConnection>(),
          c.resolve<ExecutorDispatcher>(EXECUTOR_DISPATCHER)
        )
    )
  }

  constructor(
    config: Config<ExecutorConfig>,
    logger: Logger,
    connection: BullExecutorConnection,
    dispatcher: ExecutorDispatcher
  ) {
    super(config, logger, connection, dispatcher, ANALYZE_LOG_QUEUE_NAME)
  }
}
