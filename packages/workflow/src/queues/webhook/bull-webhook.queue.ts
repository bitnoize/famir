import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  WEBHOOK_QUEUE,
  WEBHOOK_QUEUE_NAME,
  WebhookJobData,
  WebhookQueue,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullWebhookQueue extends BullBaseQueue implements WebhookQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<WebhookQueue>(
      WEBHOOK_QUEUE,
      (c) =>
        new BullWebhookQueue(
          c.resolve<Config<WorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR).connection<BullWorkflowConnection>()
        )
    )
  }

  constructor(config: Config<WorkflowConfig>, logger: Logger, connection: BullWorkflowConnection) {
    super(config, logger, connection, WEBHOOK_QUEUE_NAME)
  }

  async addJob(data: WebhookJobData): Promise<string> {
    try {
      return ''
    } catch (error) {
      this.handleException(error, 'addJob', data)
    }
  }
}
