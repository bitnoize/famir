import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import { Job, MetricsTime, Processor, Worker } from 'bullmq'
import { BullTaskWorkerConnection } from '../../bull-task-worker-connector.js'
import { TaskWorkerError } from '../../task-worker.errors.js'
import { TaskWorkerConfig, TaskWorkerOptions } from '../../task-worker.js'
import { buildOptions } from '../../task-worker.utils.js'
import { BaseManager, BaseWorker } from './base.js'

export abstract class BullBaseWorker<D, R, N extends string> implements BaseWorker {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: TaskWorkerOptions
  protected readonly _worker: Worker<D, R, N>

  constructor(
    validator: Validator,
    config: Config<TaskWorkerConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullTaskWorkerConnection,
    protected readonly manager: BaseManager<D, R, N>,
    protected readonly queueName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.options = buildOptions(config.data)

    this._worker = new Worker<D, R, N>(this.queueName, this.processorHandler, {
      connection: this.connection,
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
    if (error instanceof TaskWorkerError) {
      error.context['queue'] = this.queueName
      error.context['job'] = {
        id: job.id,
        name: job.name,
        data: job.data
      }

      throw error
    } else {
      throw new TaskWorkerError(
        'UNKNOWN_ERROR',
        {
          queue: this.queueName,
          job: {
            id: job.id,
            name: job.name,
            data: job.data
          },
          cause: error
        },
        `TaskWorker internal error`
      )
    }
  }
}
