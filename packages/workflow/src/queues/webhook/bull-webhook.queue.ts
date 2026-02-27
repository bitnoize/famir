import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { WebhookJobData } from '../../jobs/index.js'
import {
  RedisWorkflowConnection,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '../../workflow-connector.js'
import { BullWorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'
import { WEBHOOK_QUEUE, WEBHOOK_QUEUE_NAME, WebhookQueue } from './webhook.js'

export class BullWebhookQueue extends BullBaseQueue implements WebhookQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<WebhookQueue>(
      WEBHOOK_QUEUE,
      (c) =>
        new BullWebhookQueue(
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
    super(config, logger, connection, WEBHOOK_QUEUE_NAME)

    this.logger.debug(`WebhookQueue initialized`)
  }

  async addJob(name: string, data: WebhookJobData): Promise<void> {
    try {
      await this.queue.add(name, data)
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
