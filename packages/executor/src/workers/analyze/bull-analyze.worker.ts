import { ANALYZE_QUEUE_NAME, AnalyzeWorker, Config, Logger, Validator } from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { BullExecutorDispatcher } from '../../bull-executor-dispatcher.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'

export class BullAnalyzeWorker extends BullBaseWorker implements AnalyzeWorker {
  constructor(
    validator: Validator,
    config: Config<ExecutorConfig>,
    logger: Logger,
    connection: BullExecutorConnection,
    dispatcher: BullExecutorDispatcher
  ) {
    super(validator, config, logger, connection, dispatcher, ANALYZE_QUEUE_NAME)
  }
}
