import { DIContainer } from '@famir/common'
import {
  Config,
  ExecutorConnector,
  ExecutorDispatcher,
  Logger,
  PERSIST_LOG_QUEUE_NAME,
  PersistLogWorker,
  Validator
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullPersistLogWorker extends BullBaseWorker implements PersistLogWorker {
  static inject<C extends ExecutorConfig>(container: DIContainer) {
    container.registerSingleton<PersistLogWorker>(
      'PersistLogWorker',
      (c) =>
        new BullPersistLogWorker(
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
    super(validator, config, logger, connection, dispatcher, PERSIST_LOG_QUEUE_NAME)
  }
}
