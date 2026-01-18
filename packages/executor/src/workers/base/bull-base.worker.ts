import { serializeError } from '@famir/common'
import { Config, ExecutorRouter, Logger } from '@famir/domain'
import { Job, MetricsTime, Worker } from 'bullmq'
import { BullExecutorConfig, BullExecutorWorkerOptions } from '../../executor.js'
import { RedisExecutorConnection } from '../../redis-executor-connector.js'

export abstract class BullBaseWorker {
  protected readonly options: BullExecutorWorkerOptions
  protected readonly worker: Worker<unknown, unknown>

  constructor(
    config: Config<BullExecutorConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisExecutorConnection,
    protected readonly router: ExecutorRouter,
    protected readonly queueName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.worker = new Worker<unknown, unknown>(
      this.queueName,
      async (job: Job<unknown, unknown>): Promise<unknown> => {
        try {
          const processor = this.router.getProcessor(this.queueName, job.name)

          return await processor(job.data)
        } catch (error) {
          this.logger.error(`Worker processor error`, {
            error: serializeError(error),
            queue: this.queueName,
            job: this.dumpJob(job)
          })

          throw error
        }
      },
      {
        connection: this.connection,
        prefix: this.options.prefix,
        concurrency: this.options.concurrency,
        limiter: {
          max: this.options.limiterMax,
          duration: this.options.limiterDuration
        },
        autorun: false,
        removeOnComplete: {
          count: 0
        },
        removeOnFail: {
          count: 0
        },
        metrics: {
          maxDataPoints: MetricsTime.ONE_WEEK
        }
      }
    )

    this.worker.on('completed', (job: Job<unknown, unknown>) => {
      this.logger.info(`Worker completed event`, {
        queue: this.queueName,
        job: this.dumpJob(job)
      })
    })

    this.worker.on('failed', (job: Job<unknown, unknown> | undefined) => {
      this.logger.error(`Worker failed event`, {
        queue: this.queueName,
        job: job !== undefined ? this.dumpJob(job) : null
      })
    })

    this.worker.on('error', (error: unknown) => {
      this.logger.error(`Worker error event`, {
        error: serializeError(error),
        queue: this.queueName
      })
    })
  }

  async run(): Promise<void> {
    await this.worker.run()

    this.logger.debug(`Worker running`, {
      queue: this.queueName
    })
  }

  async close(): Promise<void> {
    await this.worker.close()

    this.logger.debug(`Worker closed`, {
      queue: this.queueName
    })
  }

  protected dumpJob(job: Job<unknown, unknown>): object {
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      result: job.returnvalue
    }
  }

  private buildOptions(config: BullExecutorConfig): BullExecutorWorkerOptions {
    return {
      prefix: config.EXECUTOR_PREFIX,
      concurrency: config.EXECUTOR_CONCURRENCY,
      limiterMax: config.EXECUTOR_LIMITER_MAX,
      limiterDuration: config.EXECUTOR_LIMITER_DURATION
    }
  }
}
