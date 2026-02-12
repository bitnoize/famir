import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { createClient } from 'redis'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from './database-connector.js'
import { databaseFunctions } from './database.functions.js'
import { RedisDatabaseConfig, RedisDatabaseConnectorOptions } from './database.js'

export class RedisDatabaseConnector implements DatabaseConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseConnector>(
      DATABASE_CONNECTOR,
      (c) =>
        new RedisDatabaseConnector(
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: RedisDatabaseConnectorOptions
  protected readonly redis: RedisDatabaseConnection

  constructor(
    config: Config<RedisDatabaseConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.redis = createClient({
      url: this.options.connectionUrl,
      functions: databaseFunctions,
      name: 'database',
      RESP: 3
    })

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`DatabaseConnector initialized`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this.redis as T
  }

  async connect(): Promise<void> {
    await this.redis.connect()

    this.logger.debug(`Database connected`)
  }

  async close(): Promise<void> {
    await this.redis.close()

    this.logger.debug(`Database closed`)
  }

  private buildOptions(config: RedisDatabaseConfig): RedisDatabaseConnectorOptions {
    return {
      connectionUrl: config.DATABASE_CONNECTION_URL
    }
  }
}
