import { BootstrapError, serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Job, MetricsTime, Processor, Worker } from 'bullmq'
import { ConsumerConnector } from '../../consumer-connector.js'
import { ConsumerRouter } from '../../consumer-router.js'
import { ConsumerError } from '../../consumer.error.js'
import { BullConsumerConfig, RedisConsumerConnection } from '../../consumer.js'
import { BaseWorker } from './base.worker.js'

/**
 * Specification for a Bull consumer worker.
 *
 * @category none
 */
export interface BullConsumerWorkerSpec {
  /** Maximum number of jobs to process concurrently. */
  concurrency: number
  /** Maximum number of jobs to process within the duration window. */
  limiterMax: number
  /** Time window in milliseconds for the rate limiter. */
  limiterDuration: number
}

/**
 * Options for a Bull consumer worker.
 *
 * @category none
 */
interface BullConsumerWorkerOptions extends BullConsumerWorkerSpec {
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
   * @param spec - The worker spec object.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly connector: ConsumerConnector,
    protected readonly router: ConsumerRouter,
    protected readonly queueName: string,
    protected readonly spec: BullConsumerWorkerSpec
  ) {
    const configData = this.config.get<BullConsumerConfig>('consumer-config')
    this.options = this.buildOptions(configData, spec)

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
      this.logger.info(`ConsumeWorker Bull event: completed`, {
        queue: this.queueName,
        job: this.dumpJob(job),
      })
    })

    this.worker.on('failed', (job: Job<unknown, unknown> | undefined) => {
      this.logger.error(`ConsumeWorker Bull event: failed`, {
        queue: this.queueName,
        job: this.dumpJob(job),
      })
    })

    this.worker.on('error', (error: unknown) => {
      this.logger.error(`ConsumeWorker Bull event: error`, {
        error: serializeError(error),
        queue: this.queueName,
      })
    })
  }

  #isRunning: boolean = false

  async run(): Promise<void> {
    try {
      if (!this.#isRunning) {
        this.#isRunning = true

        await this.worker.run()

        this.logger.debug(`ConsumerWorker running: ${this.queueName}`)
      } else {
        this.logger.debug(`ConsumerWorker already running: ${this.queueName}`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'run')
    }
  }

  async close(): Promise<void> {
    try {
      if (this.#isRunning) {
        this.#isRunning = false

        await this.worker.close()

        this.logger.debug(`ConsumerWorker closed: ${this.queueName}`)
      } else {
        this.logger.debug(`ConsumerWorker already closed: ${this.queueName}`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'close')
    }
  }

  /**
   * BullMQ processor handler for processing jobs.
   *
   * This method is called by BullMQ for each job. It resolves the
   * appropriate processor from the router and executes it.
   *
   * @param job - The job from the queue.
   * @throws {@link ConsumerError} If the processor is not found.
   * @throws {@link ConsumerError} If processing fails.
   */
  protected processor: Processor<unknown, unknown> = async (job) => {
    try {
      const processor = this.router.getProcessor(this.queueName, job.name)

      if (!processor) {
        throw new ConsumerError(`Internal error`, {
          code: 'INTERNAL_ERROR',
          context: {
            reason: `Processor not found`,
          },
        })
      }

      await processor.execute(job.data)
    } catch (error) {
      this.handleProcessorError(error, job)
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
      error.context['service'] = 'consumer-worker'
      error.context['queue'] = this.queueName
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'consumer-worker',
          queue: this.queueName,
          method,
        },
      })
    }
  }

  /**
   * Handles processor operation errors.
   *
   * Re-throws `ConsumerError` instances with additional context, or wraps
   * unknown errors into a `ConsumerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param job - The job where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleProcessorError(error: unknown, job: Job<unknown, unknown>): never {
    try {
      if (error instanceof ConsumerError) {
        error.context['queue'] = this.queueName
        error.context['job'] = this.dumpJob(job)

        throw error
      } else {
        throw new ConsumerError(`Unknown error`, {
          cause: error,
          context: {
            queue: this.queueName,
            job: this.dumpJob(job),
          },
          code: 'INTERNAL_ERROR',
        })
      }
    } catch (error) {
      this.logger.error(`ConsumerWorker processor job failed`, {
        error: serializeError(error),
      })

      throw error
    }
  }

  /**
   * Converts validated configuration to a worker options.
   *
   * @param data - The validated configuration object.
   * @param spec - The worker spec object.
   * @returns The worker options object.
   */
  private buildOptions(
    data: BullConsumerConfig,
    spec: BullConsumerWorkerSpec
  ): BullConsumerWorkerOptions {
    return {
      prefix: data.CONSUMER_PREFIX,
      ...spec,
    }
  }

  /**
   * Dumps a serializable representation of a job for logging.
   *
   * @param job - The job to serialize.
   * @returns A plain object with job details, or `null` if the job is nullish.
   */
  private dumpJob(job: Job<unknown, unknown> | null | undefined): object | null {
    if (!job) {
      return null
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      //result: job.returnvalue,
    }
  }
}
