import { BootstrapError, serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Queue } from 'bullmq'
import { ProducerConnector } from '../../producer-connector.js'
import { ProducerError } from '../../producer.error.js'
import { BullProducerConfig, RedisProducerConnection } from '../../producer.js'
import { BaseQueue } from './base.queue.js'

/**
 * Options for a Bull producer queue.
 *
 * @category none
 */
interface BullProducerQueueOptions {
  prefix: string
}

/**
 * Abstract base class for all Bull-based producer queues.
 *
 * All specific queue implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 * @internal
 */
export abstract class BullBaseQueue implements BaseQueue {
  /** Built queue options. */
  protected readonly options: BullProducerQueueOptions

  /** Underlying BullMQ queue instance. */
  protected readonly queue: Queue<unknown, unknown>

  /**
   * Creates a new queue instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   * @param queueName - The queue name.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly connector: ProducerConnector,
    protected readonly queueName: string
  ) {
    const conf = this.config.get<BullProducerConfig>('producer-config')
    this.options = this.buildOptions(conf)

    this.queue = new Queue<unknown, unknown>(this.queueName, {
      connection: connector.getConnection<RedisProducerConnection>(),
      prefix: this.options.prefix,
    })

    this.queue.on('error', (error: unknown) => {
      this.logger.error(`ProducerQueue Bull event: error`, {
        error: serializeError(error),
        queue: this.queueName,
      })
    })
  }

  async close(): Promise<void> {
    try {
      await this.queue.close()

      this.logger.info(`ProducerQueue closed`, { queue: this.queueName })
    } catch (error) {
      throw BootstrapError.wrap(error, {
        queue: this.queueName,
        service: 'producer-queue',
        method: 'close',
      })
    }
  }

  async getJobCount(): Promise<number> {
    try {
      return await this.queue.count()
    } catch (error) {
      throw ProducerError.wrap(error, {
        queue: this.queueName,
        method: 'getJobCount',
      })
    }
  }

  async getWorkers(): Promise<object[]> {
    try {
      const workers = await this.queue.getWorkers()

      return workers.map((worker) => {
        return {
          id: worker['id'],
          name: worker['name'],
          age: worker['age'],
        }
      })
    } catch (error) {
      throw ProducerError.wrap(error, {
        queue: this.queueName,
        method: 'getWorkers',
      })
    }
  }

  /**
   * Converts validated configuration to a queue options.
   */
  private buildOptions(conf: BullProducerConfig): BullProducerQueueOptions {
    return {
      prefix: conf.PRODUCER_PREFIX,
    }
  }
}
