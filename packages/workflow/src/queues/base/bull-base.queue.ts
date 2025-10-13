import { isDevelopment, serializeError } from '@famir/common'
import { BaseQueue, Config, Logger, WorkflowError } from '@famir/domain'
import { Queue } from 'bullmq'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig, WorkflowQueueOptions } from '../../workflow.js'
import { buildQueueOptions } from '../../workflow.utils.js'

export abstract class BullBaseQueue implements BaseQueue {
  protected readonly options: WorkflowQueueOptions
  protected readonly _queue: Queue<unknown, unknown>

  constructor(
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullWorkflowConnection,
    protected readonly queueName: string
  ) {
    this.options = buildQueueOptions(config.data)

    this._queue = new Queue<unknown, unknown>(this.queueName, {
      connection: this.connection,
      prefix: this.options.prefix
    })

    this._queue.on('error', (error: unknown) => {
      this.logger.error(`Queue error event`, {
        queue: this.queueName,
        error: serializeError(error)
      })
    })

    this.logger.debug(`Queue initialized`, {
      queue: this.queueName,
      options: isDevelopment ? this.options : null
    })
  }

  async close(): Promise<void> {
    await this._queue.close()

    this.logger.debug(`Queue closed`, {
      queue: this.queueName
    })
  }

  async getJobCount(): Promise<number> {
    try {
      return await this._queue.count()
    } catch (error) {
      this.exceptionWrapper(error, 'getJobCount', null)
    }
  }

  async getJobCounts(): Promise<Record<string, number>> {
    try {
      return await this._queue.getJobCounts()
    } catch (error) {
      this.exceptionWrapper(error, 'getJobCounts', null)
    }
  }

  protected exceptionWrapper(error: unknown, method: string, data: unknown): never {
    if (error instanceof WorkflowError) {
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new WorkflowError(`Queue unhandled error`, {
        cause: error,
        context: {
          queue: this.queueName,
          method,
          data
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
