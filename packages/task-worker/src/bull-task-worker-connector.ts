import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Redis } from 'ioredis'
import { TaskWorkerConfig, TaskWorkerConnector, TaskWorkerOptions } from './task-worker.js'
import { taskWorkerSchemas } from './task-worker.schemas.js'
import { buildOptions } from './task-worker.utils.js'

export type BullTaskWorkerConnection = Redis

export class BullTaskWorkerConnector implements TaskWorkerConnector {
  protected readonly options: TaskWorkerOptions
  private readonly _redis: BullTaskWorkerConnection

  constructor(
    validator: Validator,
    config: Config<TaskWorkerConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(taskWorkerSchemas)

    this.options = buildOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'task-worker',
      maxRetriesPerRequest: null
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
  //  this.logger.debug({}, `TaskWorkerConnector connected`)
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.debug({}, `TaskWorkerConnector closed`)
  }
}
