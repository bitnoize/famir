import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { BullTaskQueueConnection } from '../../bull-task-queue-connector.js'
import { BullBaseQueue } from '../base/index.js'
import {
  SCAN_MESSAGE_QUEUE_NAME,
  ScanMessageData,
  ScanMessageName,
  ScanMessageQueue,
  ScanMessageResult
} from './scan-message.js'

export class BullScanMessageQueue
  extends BullBaseQueue<ScanMessageData, ScanMessageResult, ScanMessageName>
  implements ScanMessageQueue
{
  constructor(validator: Validator, logger: Logger, connection: BullTaskQueueConnection) {
    super(validator, logger, connection, SCAN_MESSAGE_QUEUE_NAME)
  }

  async addTask(messageId: string): Promise<void> {
    await this._queue.add(
      'default',
      {
        messageId
      },
      {
        jobId: messageId
      }
    )
  }
}
