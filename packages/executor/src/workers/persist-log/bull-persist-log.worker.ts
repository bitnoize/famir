import {
  Config,
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
