import { isDevelopment, serializeError } from '@famir/common'
import { BaseWorker, Config, ExecutorDispatcher, ExecutorError, Logger } from '@famir/domain'
import { Job, MetricsTime, Processor, Worker } from 'bullmq'
import { BullExecutorConnection } from '../../bull-executor-connector.js'
import { ExecutorConfig, ExecutorWorkerOptions } from '../../executor.js'
import { buildWorkerOptions } from '../../executor.utils.js'

export abstract class BullBaseWorker implements BaseWorker {
  protected readonly options: ExecutorWorkerOptions
  protected readonly _worker: Worker<unknown, unknown>

  constructor(
    config: Config<ExecutorConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullExecutorConnection,
    protected readonly dispatcher: ExecutorDispatcher,
    protected readonly queueName: string
  ) {
    this.options = buildWorkerOptions(config.data)

    this._worker = new Worker<unknown, unknown>(this.queueName, this.processorHandler, {
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

    this._worker.on('completed', (job: Job<unknown, unknown>) => {
      this.logger.info(`Worker completed event`, {
        queue: this.queueName,
        job: this.dumpJob(job)
      })
    })

    this._worker.on('failed', (job: Job<unknown, unknown> | undefined) => {
      this.logger.error(`Worker failed event`, {
        queue: this.queueName,
        job: job !== undefined ? this.dumpJob(job) : null
      })
    })

    this._worker.on('error', (error: unknown) => {
      this.logger.error(`Worker error event`, {
        queue: this.queueName,
        error: serializeError(error)
      })
    })

    this.logger.debug(`Worker initialized`, {
      queue: this.queueName,
      options: isDevelopment ? this.options : null
    })
  }

  protected processorHandler: Processor<unknown, unknown> = async (job) => {
    try {
      return await this.dispatcher.applyTo(job)
    } catch (error) {
      if (error instanceof ExecutorError) {
        error.context['queue'] = this.queueName
        error.context['job'] = this.dumpJob(job)

        this.logger.error(`Worker processor error`, {
          error: serializeError(error)
        })

        throw error
      } else {
        this.logger.error(`Worker unhandled error`, {
          error: serializeError(error)
        })

        throw error
      }
    }
  }

  async run(): Promise<void> {
    await this._worker.run()

    this.logger.debug(`Worker running`, {
      queue: this.queueName
    })
  }

  async close(): Promise<void> {
    await this._worker.close()

    this.logger.debug(`Worker closed`, {
      queue: this.queueName
    })
  }

  private dumpJob(job: Job<unknown, unknown>): unknown {
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      result: job.returnvalue
    }
  }
}
