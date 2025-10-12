import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { createClient, RedisClientType } from 'redis'
import { databaseFunctions, DatabaseFunctions } from './database.functions.js'
import { DatabaseConfig, DatabaseConnectorOptions } from './database.js'
import { buildConnectorOptions, filterOptionsSecrets } from './database.utils.js'

export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>

export class RedisDatabaseConnector implements DatabaseConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseConnector>(
      DATABASE_CONNECTOR,
      (c) =>
        new RedisDatabaseConnector(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<DatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: DatabaseConnectorOptions
  private readonly _redis: RedisDatabaseConnection

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    protected readonly logger: Logger
  ) {
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

    this.logger.debug(
      {
        options: filterOptionsSecrets(this.options)
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

    this.logger.debug({}, `DatabaseConnector connected`)
  }

  async close(): Promise<void> {
    await this._redis.close()

    this.logger.debug({}, `DatabaseConnector closed`)
  }
}
