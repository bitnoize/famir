import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { createClient } from 'redis'
import { databaseFunctions } from './database.functions.js'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
  RedisDatabaseConnectorOptions,
} from './database.js'

/**
 * Redis database connector implementation.
 *
 * @category none
 * @see https://redis.io/ - Redis documentation
 * @see https://github.com/redis/node-redis - Node Redis client
 */
export class RedisDatabaseConnector implements DatabaseConnector {
  /**
   * Register connector instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseConnector>(
      DATABASE_CONNECTOR,
      (c) => new RedisDatabaseConnector(c.resolve(CONFIG), c.resolve(LOGGER))
    )
  }

  /** Builded connector options */
  protected readonly options: RedisDatabaseConnectorOptions
  /** Underlying Redis connection instance */
  protected readonly connection: RedisDatabaseConnection

  /**
   * Creates a new connector instance.
   *
   * @param config - The database config instance
   * @param logger - The logger instance
   */
  constructor(
    protected readonly config: Config<RedisDatabaseConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.connection = createClient({
      url: this.options.connectionUrl,
      functions: databaseFunctions,
      name: 'database',
      RESP: 3,
    })

    this.connection.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error),
      })
    })

    this.logger.debug(`DatabaseConnector initialized`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  async connect(): Promise<void> {
    await this.connection.connect()

    this.logger.debug(`DatabaseConnector connected`)
  }

  async close(): Promise<void> {
    await this.connection.close()

    this.logger.debug(`DatabaseConnector closed`)
  }

  /**
   * Converts a database config to a connector options.
   *
   * @param config - The database config
   * @returns A connector options object
   * @internal
   */
  private buildOptions(config: RedisDatabaseConfig): RedisDatabaseConnectorOptions {
    return {
      connectionUrl: config.DATABASE_CONNECTION_URL,
    }
  }
}
