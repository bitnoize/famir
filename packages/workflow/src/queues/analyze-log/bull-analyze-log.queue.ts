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
import { RedisWorkflowConnection } from '../../redis-workflow-connector.js'
import { BullWorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullAnalyzeLogQueue extends BullBaseQueue implements AnalyzeLogQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeLogQueue>(
      ANALYZE_LOG_QUEUE,
      (c) =>
        new BullAnalyzeLogQueue(
          c.resolve<Config<BullWorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR).connection<RedisWorkflowConnection>()
        )
    )
  }

  constructor(
    config: Config<BullWorkflowConfig>,
    logger: Logger,
    connection: RedisWorkflowConnection
  ) {
    super(config, logger, connection, ANALYZE_LOG_QUEUE_NAME)

    this.logger.debug(`AnalyzeLogQueue initialized`)
  }

  async addJob(data: AnalyzeLogJobData): Promise<string> {
    try {
      const jobId = [data.campaignId, data.messageId].join('-')

      await this.queue.add('default', data, {
        jobId
      })

      return jobId
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
