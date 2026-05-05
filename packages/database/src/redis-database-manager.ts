import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  DATABASE_CONNECTOR,
  DATABASE_MANAGER,
  DatabaseConnector,
  DatabaseManager,
  RedisDatabaseConnection,
} from './database.js'
import { redisFunctions } from './redis-functions.js'

/**
 * Redis database manager implementation.
 *
 * @category none
 */
export class RedisDatabaseManager implements DatabaseManager {
  /**
   * Register manager instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseManager>(
      DATABASE_MANAGER,
      (c) => new RedisDatabaseManager(c.resolve(LOGGER), c.resolve(DATABASE_CONNECTOR))
    )
  }

  /** Underlying Redis connection instance */
  protected readonly connection: RedisDatabaseConnection

  /**
   * Creates a new database manager instance.
   *
   * @param logger - The logger instance
   * @param connector - The database connector instance
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly connector: DatabaseConnector
  ) {
    this.connection = connector.getConnection<RedisDatabaseConnection>()

    this.logger.debug(`DatabaseManager initialized`)
  }

  async loadFunctions(): Promise<void> {
    await this.connection.FUNCTION_FLUSH()

    for (const [name, data] of redisFunctions) {
      try {
        await this.connection.FUNCTION_LOAD(data)

        this.logger.info(`Load redis functions`, { name })
      } catch (error) {
        this.logger.info(`Load redis functions error`, { name, error })
      }
    }
  }

  async cleanup(): Promise<void> {
    await this.connection.FLUSHDB()

    this.logger.warn(`Database cleaned up`)
  }
}
