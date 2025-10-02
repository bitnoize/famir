import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE_NAME,
  AnalyzeLogWorker,
  Config,
  ExecutorConnector,
  ExecutorDispatcher,
  Logger,
  Validator
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullAnalyzeLogWorker extends BullBaseWorker implements AnalyzeLogWorker {
  static inject<C extends ExecutorConfig>(container: DIContainer) {
    container.registerSingleton<AnalyzeLogWorker>(
      'AnalyzeLogWorker',
      (c) =>
        new BullAnalyzeLogWorker(
          c.resolve<Validator>('Validator'),
          c.resolve<Config<C>>('Config'),
          c.resolve<Logger>('Logger'),
          c.resolve<ExecutorConnector>('ExecutorConnector').connection<BullExecutorConnection>(),
          c.resolve<ExecutorDispatcher>('ExecutorDispatcher')
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<ExecutorConfig>,
    logger: Logger,
    connection: BullExecutorConnection,
    dispatcher: ExecutorDispatcher
  ) {
    super(validator, config, logger, connection, dispatcher, ANALYZE_LOG_QUEUE_NAME)
  }
}
