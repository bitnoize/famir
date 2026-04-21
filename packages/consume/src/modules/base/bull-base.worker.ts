import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Job, MetricsTime, Worker } from 'bullmq'
import { ConsumeRouter } from '../../consume-router.js'
import {
  BullConsumeConfig,
  BullConsumeWorkerOptions,
  ConsumeSpec,
  RedisConsumeConnection,
} from '../../consume.js'

/**
 * Bull base worker
 *
 * @category none
 * @see [BullMQ home](https://bullmq.io)
 */
export abstract class BullBaseWorker {
  protected readonly options: BullConsumeWorkerOptions
  protected readonly spec: ConsumeSpec
  protected readonly worker: Worker<unknown, unknown>

  constructor(
    protected readonly validator: Validator,
    config: Config<BullConsumeConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisConsumeConnection,
    protected readonly router: ConsumeRouter,
    protected readonly queueName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.spec = this.router.getSpec(this.queueName)

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
            job: this.dumpJob(job),
          })

          throw error
        }
      },
      {
        connection: this.connection,
        prefix: this.options.prefix,
        concurrency: this.spec.concurrency,
        limiter: {
          max: this.spec.limiterMax,
          duration: this.spec.limiterDuration,
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
      }
    )

    this.worker.on('completed', (job: Job<unknown, unknown>) => {
      this.logger.info(`Worker completed event`, {
        queue: this.queueName,
        job: this.dumpJob(job),
      })
    })

    this.worker.on('failed', (job: Job<unknown, unknown> | undefined) => {
      this.logger.error(`Worker failed event`, {
        queue: this.queueName,
        job: job !== undefined ? this.dumpJob(job) : null,
      })
    })

    this.worker.on('error', (error: unknown) => {
      this.logger.error(`Worker error event`, {
        error: serializeError(error),
        queue: this.queueName,
      })
    })
  }

  async run(): Promise<void> {
    await this.worker.run()

    this.logger.debug(`Worker running: ${this.queueName}`)
  }

  async close(): Promise<void> {
    await this.worker.close()

    this.logger.debug(`Worker closed: ${this.queueName}`)
  }

  private dumpJob(job: Job<unknown, unknown>): object {
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      result: job.returnvalue,
    }
  }

  private buildOptions(config: BullConsumeConfig): BullConsumeWorkerOptions {
    return {
      prefix: config.CONSUME_PREFIX,
    }
  }
}
