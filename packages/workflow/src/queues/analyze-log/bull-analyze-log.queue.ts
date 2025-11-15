import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  ANALYZE_LOG_QUEUE_NAME,
  AnalyzeLogJobData,
  AnalyzeLogQueue,
  Config,
  CONFIG,
  Logger,
  LOGGER,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullAnalyzeLogQueue extends BullBaseQueue implements AnalyzeLogQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeLogQueue>(
      ANALYZE_LOG_QUEUE,
      (c) =>
        new BullAnalyzeLogQueue(
          c.resolve<Config<WorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR).connection<BullWorkflowConnection>()
        )
    )
  }

  constructor(config: Config<WorkflowConfig>, logger: Logger, connection: BullWorkflowConnection) {
    super(config, logger, connection, ANALYZE_LOG_QUEUE_NAME)

    this.logger.debug(`Queue initialized`, {
      queue: this.queueName
    })
  }

  async addJob(data: AnalyzeLogJobData): Promise<string> {
    try {
      const jobId = [data.campaignId, data.messageId].join('-')

      await this.queue.add('default', data, {
        jobId
      })

      return jobId
    } catch (error) {
      this.handleException(error, 'addJob', data)
    }
  }
}
