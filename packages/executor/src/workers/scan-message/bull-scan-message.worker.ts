import {
  Config,
  Logger,
  SCAN_MESSAGE_QUEUE_NAME,
  ScanMessageJobData,
  ScanMessageJobName,
  ScanMessageJobResult,
  Validator
} from '@famir/domain'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'
import { ScanMessageManager, ScanMessageWorker } from './scan-message.js'

export class BullScanMessageWorker
  extends BullBaseWorker<ScanMessageJobData, ScanMessageJobResult, ScanMessageJobName>
  implements ScanMessageWorker
{
  constructor(
    validator: Validator,
    config: Config<ExecutorConfig>,
    logger: Logger,
    connection: BullExecutorConnection,
    manager: ScanMessageManager
  ) {
    super(validator, config, logger, connection, manager, SCAN_MESSAGE_QUEUE_NAME)
  }
}
