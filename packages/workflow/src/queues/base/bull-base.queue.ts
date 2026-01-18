import { serializeError } from '@famir/common'
import { Config, Logger, WorkflowError } from '@famir/domain'
import { Queue } from 'bullmq'
import { RedisWorkflowConnection } from '../../redis-workflow-connector.js'
import { BullWorkflowConfig, BullWorkflowQueueOptions } from '../../workflow.js'

export abstract class BullBaseQueue {
  protected readonly options: BullWorkflowQueueOptions
  protected readonly queue: Queue<unknown, unknown>

  constructor(
    config: Config<BullWorkflowConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisWorkflowConnection,
    protected readonly queueName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.queue = new Queue<unknown, unknown>(this.queueName, {
      connection: this.connection,
      prefix: this.options.prefix
    })

    this.queue.on('error', (error: unknown) => {
      this.logger.error(`Queue error event`, {
        error: serializeError(error),
        queue: this.queueName
      })
    })
  }

  async close(): Promise<void> {
    await this.queue.close()

    this.logger.debug(`Queue closed`, {
      queue: this.queueName
    })
  }

  async getJobCount(): Promise<number> {
    try {
      return await this.queue.count()
    } catch (error) {
      this.raiseError(error, 'getJobCount', null)
    }
  }

  async getJobCounts(): Promise<Record<string, number>> {
    try {
      return await this.queue.getJobCounts()
    } catch (error) {
      this.raiseError(error, 'getJobCounts', null)
    }
  }

  protected raiseError(error: unknown, method: string, data: unknown): never {
    if (error instanceof WorkflowError) {
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new WorkflowError(`Service unknown error`, {
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

  private buildOptions(config: BullWorkflowConfig): BullWorkflowQueueOptions {
    return {
      prefix: config.WORKFLOW_PREFIX
    }
  }
}
