import {
  ANALYZE_LOG_QUEUE_NAME,
  AnalyzeLogWorker,
  Config,
  ExecutorDispatcher,
  Logger,
  Validator
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullAnalyzeLogWorker extends BullBaseWorker implements AnalyzeLogWorker {
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
