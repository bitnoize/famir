import { serializeError } from '@famir/common'
import {
  BaseQueue,
  Config,
  Logger,
  Validator,
  ValidatorAssertSchema,
  WorkflowError
} from '@famir/domain'
import { Queue } from 'bullmq'
import { BullWorkflowConnection } from '../../bull-workflow-connector.js'
import { WorkflowConfig, WorkflowQueueOptions } from '../../workflow.js'
import { buildQueueOptions, filterOptionsSecrets } from '../../workflow.utils.js'

export abstract class BullBaseQueue<D, R, N extends string> implements BaseQueue {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly options: WorkflowQueueOptions
  protected readonly _queue: Queue<D, R, N>

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger,
    protected readonly connection: BullWorkflowConnection,
    protected readonly queueName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.options = buildQueueOptions(config.data)

    this._queue = new Queue<D, R, N>(this.queueName, {
      connection: this.connection,
      prefix: this.options.prefix
    })

    this._queue.on('error', (error: unknown) => {
      this.logger.error(
        {
          module: 'workflow',
          queue: this.queueName,
          error: serializeError(error)
        },
        `Queue error event`
      )
    })

    this.logger.debug(
      {
        module: 'workflow',
        queue: this.queueName,
        options: filterOptionsSecrets(this.options)
      },
      `Queue initialized`
    )
  }

  async close(): Promise<void> {
    await this._queue.close()

    this.logger.debug(
      {
        module: 'workflow',
        queue: this.queueName
      },
      `Queue closed`
    )
  }

  async getJobCount(): Promise<number> {
    return await this._queue.count()
  }

  async getJobCounts(): Promise<Record<string, number>> {
    return await this._queue.getJobCounts()
  }

  protected exceptionFilter(
    error: unknown,
    method: string,
    params: Record<string, unknown> = {}
  ): never {
    if (error instanceof WorkflowError) {
      error.context['module'] = 'workflow'
      error.context['queue'] = this.queueName
      error.context['method'] = method
      error.context['params'] = params

      throw error
    } else {
      throw new WorkflowError(`Queue internal error`, {
        cause: error,
        context: {
          module: 'workflow',
          queue: this.queueName,
          method,
          params
        },
        code: 'UNKNOWN'
      })
    }
  }
}
