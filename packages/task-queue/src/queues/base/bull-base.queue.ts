import { serializeError } from '@famir/common'
import { Logger } from '@famir/logger'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import { Queue } from 'bullmq'
import { BullTaskQueueConnection } from '../../bull-task-queue-connector.js'
import { BaseQueue } from './base.js'

export abstract class BullBaseQueue<D, R, N extends string> implements BaseQueue {
  protected readonly assertSchema: ValidatorAssertSchema
  protected readonly _queue: Queue<D, R, N>

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly connection: BullTaskQueueConnection,
    protected readonly queueName: string
  ) {
    this.assertSchema = validator.assertSchema

    this._queue = new Queue<D, R, N>(this.queueName, {
      connection: this.connection
    })

    this._queue.on('error', (error: unknown) => {
      this.logger.error(
        {
          queue: this.queueName,
          error: serializeError(error)
        },
        `Queue error event`
      )
    })
  }

  async close(): Promise<void> {
    await this._queue.close()
  }

  async getTaskCount(): Promise<number> {
    return await this._queue.count()
  }

  async getTaskCounts(): Promise<Record<string, number>> {
    return await this._queue.getJobCounts()
  }
}
