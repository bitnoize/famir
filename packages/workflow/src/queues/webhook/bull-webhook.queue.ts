import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR,
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
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<WorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR).connection<BullWorkflowConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    logger: Logger,
    connection: BullWorkflowConnection
  ) {
    super(validator, config, logger, connection, WEBHOOK_QUEUE_NAME)
  }

  async addJob(data: WebhookJobData): Promise<string> {
    return ''
  }
}
