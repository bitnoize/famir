import { filterSecrets, serializeError } from '@famir/common'
import { Config, ExecutorConnector, Logger, Validator } from '@famir/domain'
import { Redis } from 'ioredis'
import { ExecutorConfig, ExecutorConnectorOptions } from './executor.js'
import { executorSchemas } from './executor.schemas.js'
import { buildConnectorOptions } from './executor.utils.js'

export type BullExecutorConnection = Redis

export class BullExecutorConnector implements ExecutorConnector {
  protected readonly options: ExecutorConnectorOptions
  private readonly _redis: BullExecutorConnection

  constructor(
    validator: Validator,
    config: Config<ExecutorConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(executorSchemas)

    this.options = buildConnectorOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'executor',
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

    this.logger.info(
      {
        options: filterSecrets(this.options, ['connectionUrl'])
      },
      `BullExecutorConnector initialized`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  //async connect(): Promise<void> {
  //  await this._redis.connect()
  //
  //  this.logger.info({}, `ExecutorConnector connected`)
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.info({}, `BullExecutorConnector closed`)
  }
}
