import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Queue } from 'bullmq'
import { ProduceError } from '../../produce.error.js'
import {
  BullProduceConfig,
  BullProduceQueueOptions,
  RedisProduceConnection,
} from '../../produce.js'

/**
 * Bull base queue
 * @category Queues
 */
export abstract class BullBaseQueue {
  protected readonly options: BullProduceQueueOptions
  protected readonly queue: Queue<unknown, unknown>

  constructor(
    config: Config<BullProduceConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisProduceConnection,
    protected readonly queueName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.queue = new Queue<unknown, unknown>(this.queueName, {
      connection: this.connection,
      prefix: this.options.prefix,
    })

    this.queue.on('error', (error: unknown) => {
      this.logger.error(`Queue error event`, {
        error: serializeError(error),
        queue: this.queueName,
      })
    })
  }

  async close(): Promise<void> {
    await this.queue.close()

    this.logger.debug(`Queue closed: ${this.queueName}`)
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
    if (error instanceof ProduceError) {
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new ProduceError(`Service internal error`, {
        cause: error,
        context: {
          queue: this.queueName,
          method,
          data,
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  private buildOptions(config: BullProduceConfig): BullProduceQueueOptions {
    return {
      prefix: config.PRODUCE_PREFIX,
    }
  }
}
