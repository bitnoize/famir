import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  EXECUTOR_CONNECTOR,
  EXECUTOR_DISPATCHER,
  ExecutorConnector,
  ExecutorDispatcher,
  Logger,
  LOGGER,
  PERSIST_LOG_QUEUE_NAME,
  PERSIST_LOG_WORKER,
  PersistLogWorker,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullPersistLogWorker extends BullBaseWorker implements PersistLogWorker {
  static inject(container: DIContainer) {
    container.registerSingleton<PersistLogWorker>(
      PERSIST_LOG_WORKER,
      (c) =>
        new BullPersistLogWorker(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<ExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR).connection<BullExecutorConnection>(),
          c.resolve<ExecutorDispatcher>(EXECUTOR_DISPATCHER)
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
