import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { AnalyzeJobData } from '../../jobs/index.js'
import {
  RedisWorkflowConnection,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '../../workflow-connector.js'
import { BullWorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'
import { ANALYZE_QUEUE, ANALYZE_QUEUE_NAME, AnalyzeQueue } from './analyze.js'

export class BullAnalyzeQueue extends BullBaseQueue implements AnalyzeQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeQueue>(
      ANALYZE_QUEUE,
      (c) =>
        new BullAnalyzeQueue(
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
    super(config, logger, connection, ANALYZE_QUEUE_NAME)

    this.logger.debug(`AnalyzeQueue initialized`)
  }

  async addJob(name: string, data: AnalyzeJobData): Promise<void> {
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
