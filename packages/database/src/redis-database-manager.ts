import { DIContainer } from '@famir/common'
import {
  DATABASE_CONNECTOR,
  DATABASE_MANAGER,
  DatabaseConnector,
  DatabaseManager,
  Logger,
  LOGGER
} from '@famir/domain'
import { RedisDatabaseConnection } from './redis-database-connector.js'
import { getRedisFunctionsDump } from './redis-functions-dump.js'

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
  ) {}

  async loadFunctions(): Promise<void> {
    const dump = getRedisFunctionsDump().toString('binary')

    await this.connection.FUNCTION_RESTORE(dump, {
      mode: 'FLUSH'
    })

    this.logger.warn(`Database functions restored`)
  }

  async cleanup(): Promise<void> {
    await this.connection.FLUSHDB()

    this.logger.warn(`Database cleaned up`)
  }
}
