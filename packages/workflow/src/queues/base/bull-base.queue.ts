import { serializeError } from '@famir/common'
import {
  BaseQueue,
  Config,
  Logger,
  Validator,
  ValidatorAssertSchema,
  WorkflowError
} from '@famir/domain'
import { Queue } from 'bullmq'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig, WorkflowQueueOptions } from '../../workflow.js'
import { buildQueueOptions, filterOptionsSecrets } from '../../workflow.utils.js'

export abstract class BullBaseQueue implements BaseQueue {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: WorkflowQueueOptions
  protected readonly _queue: Queue<unknown, unknown>

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullWorkflowConnection,
    protected readonly queueName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.options = buildQueueOptions(config.data)

    this._queue = new Queue<unknown, unknown>(this.queueName, {
      connection: this.connection,
      prefix: this.options.prefix
    })

    this._queue.on('error', (error: unknown) => {
      this.logger.error(
        {
          queue: this.queueName,
          error: serializeError(error)
        },
        `Queue error event`
      )
    })

    this.logger.debug(
      {
        queue: this.queueName,
        options: filterOptionsSecrets(this.options)
      },
      `Queue initialized`
    )
  }

  async close(): Promise<void> {
    await this._queue.close()

    this.logger.debug(
      {
        queue: this.queueName
      },
      `Queue closed`
    )
  }

  async getJobCount(): Promise<number> {
    try {
      return await this._queue.count()
    } catch (error) {
      this.exceptionWrapper(error, 'getJobCount', undefined)
    }
  }

  async getJobCounts(): Promise<Record<string, number>> {
    try {
      return await this._queue.getJobCounts()
    } catch (error) {
      this.exceptionWrapper(error, 'getJobCounts', undefined)
    }
  }

  protected exceptionWrapper(error: unknown, method: string, data: unknown): never {
    if (error instanceof WorkflowError) {
      error.context['module'] = 'workflow'
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new WorkflowError(`Queue unhandled error`, {
        cause: error,
        context: {
          module: 'workflow',
          queue: this.queueName,
          method,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
