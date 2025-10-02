import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE_NAME,
  AnalyzeLogJobData,
  AnalyzeLogQueue,
  Config,
  Logger,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullAnalyzeLogQueue extends BullBaseQueue implements AnalyzeLogQueue {
  static inject<C extends WorkflowConfig>(container: DIContainer) {
    container.registerSingleton<AnalyzeLogQueue>(
      'AnalyzeLogQueue',
      (c) =>
        new BullAnalyzeLogQueue(
          c.resolve<Validator>('Validator'),
          c.resolve<Config<C>>('Config'),
          c.resolve<Logger>('Logger'),
          c.resolve<WorkflowConnector>('WorkflowConnector').connection<BullWorkflowConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    logger: Logger,
    connection: BullWorkflowConnection
  ) {
    super(validator, config, logger, connection, ANALYZE_LOG_QUEUE_NAME)
  }

  async addJob(data: AnalyzeLogJobData): Promise<string> {
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
