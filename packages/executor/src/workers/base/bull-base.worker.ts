import { serializeError } from '@famir/common'
import { Config, ExecutorError, Logger, Validator, ValidatorAssertSchema } from '@famir/domain'
import { Job, MetricsTime, Processor, Worker } from 'bullmq'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig, ExecutorWorkerOptions } from '../../executor.js'
import { buildWorkerOptions } from '../../executor.utils.js'
import { BaseManager, BaseWorker } from './base.js'

export abstract class BullBaseWorker<D, R, N extends string> implements BaseWorker {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: ExecutorWorkerOptions
  protected readonly _worker: Worker<D, R, N>

  constructor(
    validator: Validator,
    config: Config<ExecutorConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullExecutorConnection,
    protected readonly manager: BaseManager<D, R, N>,
    protected readonly queueName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.options = buildWorkerOptions(config.data)

    this._worker = new Worker<D, R, N>(this.queueName, this.processorHandler, {
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
    })

    this._worker.on('completed', (job: Job<D, R, N>) => {
      this.logger.info(
        {
          queue: this.queueName,
          job: {
            id: job.id,
            name: job.name,
            data: job.data,
            result: job.returnvalue
          }
        },
        `Worker completed event`
      )
    })

    this._worker.on('failed', (job: Job<D, R, N> | undefined) => {
      this.logger.error(
        {
          queue: this.queueName,
          job:
            job !== undefined
              ? {
                  id: job.id,
                  name: job.name,
                  data: job.data
                }
              : null
        },
        `Worker failed event`
      )
    })

    this._worker.on('error', (error: unknown) => {
      this.logger.error(
        {
          queue: this.queueName,
          error: serializeError(error)
        },
        `Worker error event`
      )
    })
  }

  protected processorHandler: Processor<D, R, N> = async (job) => {
    try {
      return await this.manager.applyTo(job)
    } catch (error) {
      return this.exceptionFilter(error, job)
    }
  }

  async run(): Promise<void> {
    await this._worker.run()
  }

  async close(): Promise<void> {
    await this._worker.close()
  }

  protected exceptionFilter(error: unknown, job: Job<D, R, N>): never {
    if (error instanceof ExecutorError) {
      error.context['queue'] = this.queueName
      error.context['job'] = {
        id: job.id,
        name: job.name,
        data: job.data
      }

      throw error
    } else {
      throw new ExecutorError(
        {
          queue: this.queueName,
          job: {
            id: job.id,
            name: job.name,
            data: job.data
          },
          cause: error
        },
        `Executor internal error`
      )
    }
  }
}
