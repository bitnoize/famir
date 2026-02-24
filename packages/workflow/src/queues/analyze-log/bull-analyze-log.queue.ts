import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { AnalyzeLogJobData } from '../../jobs/index.js'
import {
  RedisWorkflowConnection,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '../../workflow-connector.js'
import { BullWorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'
import { ANALYZE_LOG_QUEUE, ANALYZE_LOG_QUEUE_NAME, AnalyzeLogQueue } from './analyze-log.js'

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

  async addJob(name: string, data: AnalyzeLogJobData): Promise<void> {
    try {
      const jobId = [data.campaignId, data.messageId].join('-')

      await this.queue.add(name, data, {
        jobId
      })
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
