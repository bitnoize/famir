import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  DATABASE_CONNECTOR,
  DATABASE_MANAGER,
  DatabaseConnector,
  DatabaseManager,
  RedisDatabaseConnection
} from './database.js'
import { makeRedisFunctions } from './redis-functions.js'

/*
 * Redis database manager implementation
 */
export class RedisDatabaseManager implements DatabaseManager {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseManager>(
      DATABASE_MANAGER,
      (c) =>
        new RedisDatabaseManager(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).getConnection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly connection: RedisDatabaseConnection
  ) {
    this.logger.debug(`DatabaseManager initialized`)
  }

  /*
   * Load database functions
   */
  async loadFunctions(): Promise<void> {
    await this.connection.FUNCTION_FLUSH()

    for (const [name, data] of makeRedisFunctions()) {
      this.logger.info(`Load redis functions: ${name}`)

      await this.connection.FUNCTION_LOAD(data)
    }
  }

  /*
   * Cleanup database
   */
  async cleanup(): Promise<void> {
    await this.connection.FLUSHDB()

    this.logger.warn(`Database cleaned up`)
  }
}
