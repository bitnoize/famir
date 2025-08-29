import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import {
  SCAN_MESSAGE_QUEUE_NAME,
  ScanMessageData,
  ScanMessageName,
  ScanMessageResult
} from '@famir/task-queue'
import { Validator } from '@famir/validator'
import { BullTaskWorkerConnection } from '../../bull-task-worker-connector.js'
import { TaskWorkerConfig } from '../../task-worker.js'
import { BullBaseWorker } from '../base/index.js'
import { ScanMessageDispatcher, ScanMessageWorker } from './scan-message.js'

export class BullScanMessageWorker
  extends BullBaseWorker<ScanMessageData, ScanMessageResult, ScanMessageName>
  implements ScanMessageWorker
{
  constructor(
    validator: Validator,
    config: Config<TaskWorkerConfig>,
    logger: Logger,
    connection: BullTaskWorkerConnection,
    dispatcher: ScanMessageDispatcher
  ) {
    super(validator, config, logger, connection, dispatcher, SCAN_MESSAGE_QUEUE_NAME)
  }
}
