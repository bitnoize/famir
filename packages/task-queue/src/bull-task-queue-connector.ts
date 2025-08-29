import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Redis } from 'ioredis'
import { TaskQueueConfig, TaskQueueConnector, TaskQueueOptions } from './task-queue.js'
import { taskQueueSchemas } from './task-queue.schemas.js'
import { buildConnectorOptions } from './task-queue.utils.js'

export type BullTaskQueueConnection = Redis

export class BullTaskQueueConnector implements TaskQueueConnector {
  protected readonly options: TaskQueueOptions
  private readonly _redis: BullTaskQueueConnection

  constructor(
    validator: Validator,
    config: Config<TaskQueueConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(taskQueueSchemas)

    this.options = buildConnectorOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'task-queue'
    })

    this._redis.on('error', (error) => {
      this.logger.error(
        {
          error: serializeError(error)
        },
        `Redis error event`
      )
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  //async connect(): Promise<void> {
  //  await this._redis.connect()
  //
  //  this.logger.debug({}, `TaskQueueConnector connected`)
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.debug({}, `TaskQueueConnector closed`)
  }
}
