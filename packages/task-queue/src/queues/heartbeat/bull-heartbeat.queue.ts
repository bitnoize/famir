import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { BullTaskQueueConnection } from '../../bull-task-queue-connector.js'
import { BullBaseQueue } from '../base/index.js'
import {
  HEARTBEAT_QUEUE_NAME,
  HeartbeatData,
  HeartbeatName,
  HeartbeatQueue,
  HeartbeatResult
} from './heartbeat.js'

export class BullHeartbeatQueue
  extends BullBaseQueue<HeartbeatData, HeartbeatResult, HeartbeatName>
  implements HeartbeatQueue
{
  constructor(validator: Validator, logger: Logger, connection: BullTaskQueueConnection) {
    super(validator, logger, connection, HEARTBEAT_QUEUE_NAME)
  }

  async upsertScanSessionsScheduler(every: number): Promise<void> {
    await this._queue.upsertJobScheduler(
      'scan-sessions',
      {
        every
      },
      {
        data: null
      }
    )
  }

  async removeScanSessionsScheduler(): Promise<void> {
    await this._queue.removeJobScheduler('scan-sessions')
  }

  async upsertScanMessagesScheduler(every: number): Promise<void> {
    await this._queue.upsertJobScheduler(
      'scan-messages',
      {
        every
      },
      {
        data: null
      }
    )
  }

  async removeScanMessagesScheduler(): Promise<void> {
    await this._queue.removeJobScheduler('scan-messages')
  }
}
