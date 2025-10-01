import {
  ANALYZE_QUEUE_NAME,
  AnalyzeJobData,
  AnalyzeQueue,
  Config,
  Logger,
  Validator
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullAnalyzeQueue extends BullBaseQueue implements AnalyzeQueue {
  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    logger: Logger,
    connection: BullWorkflowConnection
  ) {
    super(validator, config, logger, connection, ANALYZE_QUEUE_NAME)
  }

  async addJob(data: AnalyzeJobData): Promise<string> {
    const jobId = [data.campaignId, data.messageId].join('-')

    try {
      await this._queue.add('default', data, {
        jobId
      })

      return jobId
    } catch (error) {
      this.exceptionFilter(error, 'addJob', data)
    }
  }
}
