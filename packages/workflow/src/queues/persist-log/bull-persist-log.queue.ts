import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  PERSIST_LOG_QUEUE,
  PERSIST_LOG_QUEUE_NAME,
  PersistLogJobData,
  PersistLogQueue,
  Validator,
  VALIDATOR,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig } from '../../workflow.js'
import { BullBaseQueue } from '../base/index.js'

export class BullPersistLogQueue extends BullBaseQueue implements PersistLogQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<PersistLogQueue>(
      PERSIST_LOG_QUEUE,
      (c) =>
        new BullPersistLogQueue(
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
    super(validator, config, logger, connection, PERSIST_LOG_QUEUE_NAME)
  }

  async addJob(data: PersistLogJobData): Promise<string> {
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
