import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER
} from '@famir/domain'
import { createClient, RedisClientType } from 'redis'
import { databaseFunctions, DatabaseFunctions } from './database.functions.js'
import { DatabaseConfig, DatabaseConnectorOptions } from './database.js'
import { buildConnectorOptions } from './database.utils.js'

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
          c.resolve<Config<DatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: DatabaseConnectorOptions
  private readonly _redis: RedisDatabaseConnection

  constructor(
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
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`DatabaseConnector initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  async connect(): Promise<void> {
    await this._redis.connect()

    this.logger.debug(`DatabaseConnector connected`)
  }

  async close(): Promise<void> {
    await this._redis.close()

    this.logger.debug(`DatabaseConnector closed`)
  }
}
