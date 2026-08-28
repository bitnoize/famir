import { LifecycleError, serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Job, MetricsTime, Processor, Worker } from 'bullmq'
import { ConsumerConnector } from '../../consumer-connector.js'
import { ConsumerRouter } from '../../consumer-router.js'
import { ConsumerError } from '../../consumer.error.js'
import { BullConsumerConfig, RedisConsumerConnection } from '../../consumer.js'
import { BaseWorker, ConsumerWorkerSettings } from './base.worker.js'

/**
 * Options for a Bull consumer worker.
 *
 * @category none
 */
interface BullConsumerWorkerOptions extends ConsumerWorkerSettings {
  prefix: string
}

/**
 * Abstract base class for all Bull-based consumer workers.
 *
 * All specific worker implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 * @internal
 */
export abstract class BullBaseWorker implements BaseWorker {
  /** Built worker options. */
  protected readonly options: BullConsumerWorkerOptions

  /** Underlying BullMQ worker instance. */
  protected readonly worker: Worker<unknown, unknown>

  /**
   * Creates a new worker instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   * @param router - The router instance.
   * @param queueName - The name of the queue.
   * @param settings - The settings object.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly connector: ConsumerConnector,
    protected readonly router: ConsumerRouter,
    protected readonly queueName: string,
    settings: Partial<ConsumerWorkerSettings>
  ) {
    const conf = this.config.get<BullConsumerConfig>('consumer-config')
    this.options = this.buildOptions(conf, settings)

    this.worker = new Worker<unknown, unknown>(queueName, this.processor, {
      connection: connector.getConnection<RedisConsumerConnection>(),
      prefix: this.options.prefix,
      concurrency: this.options.concurrency,
      limiter: {
        max: this.options.limiterMax,
        duration: this.options.limiterDuration,
      },
      autorun: false,
      removeOnComplete: {
        count: 0,
      },
      removeOnFail: {
        count: 0,
      },
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK,
      },
    })

    this.worker.on('completed', (job: Job<unknown, unknown>) => {
      this.logger.debug(`ConsumerWorker Bull event: completed`, {
        consumer: {
          queue: this.queueName,
          job: this.dumpJob(job),
          status: 'completed',
        },
      })
    })

    this.worker.on('failed', (job: Job<unknown, unknown> | undefined) => {
      this.logger.debug(`ConsumerWorker Bull event: failed`, {
        consumer: {
          queue: this.queueName,
          job: this.dumpJob(job),
          status: 'failed',
        },
      })
    })

    this.worker.on('error', (error: unknown) => {
      this.logger.error(`ConsumerWorker Bull event: error`, {
        error: serializeError(error),
      })
    })
  }

  async run(): Promise<void> {
    try {
      await this.worker.run()

      this.logger.info(`ConsumerWorker running: ${this.queueName}`)
    } catch (error) {
      throw LifecycleError.wrap(error, {
        queue: this.queueName,
        service: 'consumer-worker',
        method: 'run',
      })
    }
  }

  async close(): Promise<void> {
    try {
      await this.worker.close()

      this.logger.debug(`ConsumerWorker closed: ${this.queueName}`)
    } catch (error) {
      throw LifecycleError.wrap(error, {
        queue: this.queueName,
        service: 'consumer-worker',
        method: 'close',
      })
    }
  }

  /**
   * BullMQ processor handler for processing jobs.
   *
   * This method is called by BullMQ for each job. It resolves the
   * appropriate processor from the router and executes it.
   *
   * @param job - The job from the queue.
   * @throws ConsumerError If the processor is not found.
   * @throws ConsumerError If processing fails.
   */
  protected processor: Processor<unknown, unknown> = async (job) => {
    try {
      const processor = this.router.getProcessor(this.queueName, job.name)

      if (!processor) {
        throw ConsumerError.internalError(`Processor not found`, {
          queue: this.queueName,
          job: job.name,
        })
      }

      await processor.execute(job.data)
    } catch (error) {
      this.logger.error(`ConsumerWorker processor job failed`, {
        error: serializeError(error),
      })

      throw error
    }
  }

  /**
   * Converts validated configuration and settings to a worker options.
   */
  private buildOptions(
    conf: BullConsumerConfig,
    settings: Partial<ConsumerWorkerSettings>
  ): BullConsumerWorkerOptions {
    return {
      prefix: conf.CONSUMER_PREFIX,
      concurrency: settings.concurrency ?? 2,
      limiterMax: settings.limiterMax ?? 1,
      limiterDuration: settings.limiterDuration ?? 1000,
    }
  }

  /**
   * Dumps a serializable representation of a job for logging.
   */
  private dumpJob(job: Job<unknown, unknown> | null | undefined): object | null {
    if (!job) {
      return null
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
    }
  }
}
