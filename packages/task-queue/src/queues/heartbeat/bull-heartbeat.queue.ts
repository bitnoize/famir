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
    try {
      await this._queue.upsertJobScheduler(
        'scan-sessions',
        {
          every
        },
        {
          data: null
        }
      )
    } catch (error) {
      this.exceptionFilter(error, 'upsertScanSessionsScheduler', { every })
    }
  }

  async removeScanSessionsScheduler(): Promise<void> {
    try {
      await this._queue.removeJobScheduler('scan-sessions')
    } catch (error) {
      this.exceptionFilter(error, 'removeScanSessionsScheduler')
    }
  }

  async upsertScanMessagesScheduler(every: number): Promise<void> {
    try {
      await this._queue.upsertJobScheduler(
        'scan-messages',
        {
          every
        },
        {
          data: null
        }
      )
    } catch (error) {
      this.exceptionFilter(error, 'upsertScanMessagesScheduler', { every })
    }
  }

  async removeScanMessagesScheduler(): Promise<void> {
    try {
      await this._queue.removeJobScheduler('scan-messages')
    } catch (error) {
      this.exceptionFilter(error, 'removeScanMessagesScheduler')
    }
  }
}
