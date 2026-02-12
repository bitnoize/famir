import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from './database-connector.js'
import { DATABASE_MANAGER, DatabaseManager } from './database-manager.js'
import { getRedisFunctions } from './redis-functions.js'

export class RedisDatabaseManager implements DatabaseManager {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseManager>(
      DATABASE_MANAGER,
      (c) =>
        new RedisDatabaseManager(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly connection: RedisDatabaseConnection
  ) {
    this.logger.debug(`DatabaseManager initialized`)
  }

  async loadFunctions(): Promise<void> {
    await this.connection.FUNCTION_FLUSH()

    const redisFunctions = getRedisFunctions()

    for (const redisFunction of redisFunctions) {
      await this.connection.FUNCTION_LOAD(redisFunction)
    }

    this.logger.warn(`Database functions loaded`)
  }

  async cleanup(): Promise<void> {
    await this.connection.FLUSHDB()

    this.logger.warn(`Database cleaned up`)
  }
}
