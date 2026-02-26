import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Job, MetricsTime, Worker } from 'bullmq'
import { RedisExecutorConnection } from '../../executor-connector.js'
import { ExecutorRouter } from '../../executor-router.js'
import { ExecutorError } from '../../executor.error.js'
import {
  BullExecutorConfig,
  BullExecutorWorkerOptions,
  ExecutorWorkerSpec,
  ExecutorWorkerSpecs
} from '../../executor.js'

export abstract class BullBaseWorker {
  protected readonly options: BullExecutorWorkerOptions
  protected readonly spec: ExecutorWorkerSpec
  protected readonly worker: Worker<unknown, unknown>

  constructor(
    protected readonly validator: Validator,
    config: Config<BullExecutorConfig>,
    protected readonly logger: Logger,
    protected readonly connection: RedisExecutorConnection,
    protected readonly router: ExecutorRouter,
    protected readonly queueName: string
  ) {
    this.options = this.buildOptions(config.data)

    this.spec = this.getSpec(this.router.specs, this.queueName)

    this.worker = new Worker<unknown, unknown>(
      this.queueName,
      async (job: Job<unknown, unknown>): Promise<unknown> => {
        try {
          const processor = this.router.resolve(this.queueName, job.name)

          if (!processor) {
            throw new ExecutorError(`Processor not exists`, {
              code: 'UNKNOWN_JOB'
            })
          }

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
        concurrency: this.spec.concurrency,
        limiter: {
          max: this.spec.limiterMax,
          duration: this.spec.limiterDuration
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

    this.logger.debug(`Worker running: ${this.queueName}`)
  }

  async close(): Promise<void> {
    await this.worker.close()

    this.logger.debug(`Worker closed: ${this.queueName}`)
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
      prefix: config.EXECUTOR_PREFIX
    }
  }

  private getSpec(specs: ExecutorWorkerSpecs, queueName: string): ExecutorWorkerSpec {
    const spec = specs[queueName]

    if (!spec) {
      throw new Error(`ExecutorWorkerSpec not exists: ${queueName}`)
    }

    return spec
  }
}
