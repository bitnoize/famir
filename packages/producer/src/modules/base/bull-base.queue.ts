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
    const configData = this.config.get<BullProducerConfig>('producer-config')
    this.options = this.buildOptions(configData)

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

      this.logger.debug(`ProducerQueue closed: ${this.queueName}`)
    } catch (error) {
      this.handleBootstrapError(error, 'close')
    }
  }

  async getJobCount(): Promise<number> {
    try {
      return await this.queue.count()
    } catch (error) {
      this.handleQueueError(error, 'getJobCount', null)
    }
  }

  /**
   * Handles bootstrap operation errors.
   *
   * Re-throws `BootstrapError` instances with additional context, or wraps
   * unknown errors into a `BootstrapError`.
   *
   * @param error - The caught error.
   * @param method - The name of the method where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleBootstrapError(error: unknown, method: string): never {
    if (error instanceof BootstrapError) {
      error.context['service'] = 'producer-queue'
      error.context['queue'] = this.queueName
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'producer-queue',
          queue: this.queueName,
          method,
        },
      })
    }
  }

  /**
   * Handles queue operation errors.
   *
   * Re-throws `ProducerError` instances with additional context, or wraps
   * unknown errors into a `ProducerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param method - The name of the method where the error occurred.
   * @param data - The data that was being processed.
   * @returns Never returns, always throws.
   */
  protected handleQueueError(error: unknown, method: string, data: unknown): never {
    if (error instanceof ProducerError) {
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['data'] = data

      throw error
    } else {
      throw new ProducerError(`Unknown error`, {
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

  /**
   * Converts validated configuration to a queue options.
   *
   * @param data - The validated configuration object.
   * @returns The queue options object.
   */
  private buildOptions(data: BullProducerConfig): BullProducerQueueOptions {
    return {
      prefix: data.PRODUCER_PREFIX,
    }
  }
}
