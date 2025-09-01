import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { BullTaskQueueConnection } from '../../bull-task-queue-connector.js'
import { BullBaseQueue } from '../base/index.js'
import {
  SCAN_SESSION_QUEUE_NAME,
  ScanSessionData,
  ScanSessionName,
  ScanSessionQueue,
  ScanSessionResult
} from './scan-session.js'

export class BullScanSessionQueue
  extends BullBaseQueue<ScanSessionData, ScanSessionResult, ScanSessionName>
  implements ScanSessionQueue
{
  constructor(validator: Validator, logger: Logger, connection: BullTaskQueueConnection) {
    super(validator, logger, connection, SCAN_SESSION_QUEUE_NAME)
  }

  async addTask(sessionId: string): Promise<void> {
    try {
      await this._queue.add(
        'default',
        {
          sessionId
        },
        {
          jobId: sessionId
        }
      )
    } catch (error) {
      this.exceptionFilter(error, 'addTask', { sessionId })
    }
  }
}
