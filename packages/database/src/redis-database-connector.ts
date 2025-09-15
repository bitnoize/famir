import { filterSecrets, serializeError } from '@famir/common'
import { Config, DatabaseConnector, Logger, Validator } from '@famir/domain'
import { createClient, RedisClientType } from 'redis'
import { databaseFunctions, DatabaseFunctions } from './database.functions.js'
import { DatabaseConfig, DatabaseConnectorOptions } from './database.js'
import { databaseSchemas } from './database.schemas.js'
import { buildConnectorOptions } from './database.utils.js'

export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>

export class RedisDatabaseConnector implements DatabaseConnector {
  protected readonly options: DatabaseConnectorOptions
  private readonly _redis: RedisDatabaseConnection

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(databaseSchemas)

    this.options = buildConnectorOptions(config.data)

    this._redis = createClient({
      url: this.options.connectionUrl,
      functions: databaseFunctions,
      name: 'database',
      RESP: 3
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
      `DatabaseConnector initialized`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  async connect(): Promise<void> {
    await this._redis.connect()

    this.logger.info({}, `DatabaseConnector connected`)
  }

  async close(): Promise<void> {
    await this._redis.close()

    this.logger.info({}, `DatabaseConnector closed`)
  }
}
