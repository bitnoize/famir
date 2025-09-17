import {
  Config,
  Logger,
  SCAN_MESSAGE_QUEUE_NAME,
  ScanMessageJobData,
  ScanMessageJobName,
  ScanMessageJobResult,
  ScanMessageQueue,
  Validator
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullScanMessageQueue
  extends BullBaseQueue<ScanMessageJobData, ScanMessageJobResult, ScanMessageJobName>
  implements ScanMessageQueue
{
  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    logger: Logger,
    connection: BullWorkflowConnection
  ) {
    super(validator, config, logger, connection, SCAN_MESSAGE_QUEUE_NAME)
  }

  async addJob(messageId: string): Promise<void> {
    try {
      await this._queue.add(
        'default',
        {
          messageId
        },
        {
          jobId: messageId
        }
      )
    } catch (error) {
      this.exceptionFilter(error, 'addJob', { messageId })
    }
  }
}
