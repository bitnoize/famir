import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import {
  SCAN_SESSION_QUEUE_NAME,
  ScanSessionData,
  ScanSessionName,
  ScanSessionResult
} from '@famir/task-queue'
import { Validator } from '@famir/validator'
import { BullTaskWorkerConnection } from '../../bull-task-worker-connector.js'
import { TaskWorkerConfig } from '../../task-worker.js'
import { BullBaseWorker } from '../base/index.js'
import { ScanSessionDispatcher, ScanSessionWorker } from './scan-session.js'

export class BullScanSessionWorker
  extends BullBaseWorker<ScanSessionData, ScanSessionResult, ScanSessionName>
  implements ScanSessionWorker
{
  constructor(
    validator: Validator,
    config: Config<TaskWorkerConfig>,
    logger: Logger,
    connection: BullTaskWorkerConnection,
    dispatcher: ScanSessionDispatcher
  ) {
    super(validator, config, logger, connection, dispatcher, SCAN_SESSION_QUEUE_NAME)
  }
}
