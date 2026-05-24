import { DIContainer } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/database'

/**
 * DI token for the database service.
 *
 * @category Database
 */
export const DATABASE_SERVICE = Symbol('DatabaseService')

/**
 * Represents the database service.
 *
 * @category Database
 */
export class DatabaseService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseService>(
      DATABASE_SERVICE,
      (c) => new DatabaseService(c.resolve<DatabaseManager>(DATABASE_MANAGER))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param databaseManager - The database manager instance.
   */
  constructor(protected readonly databaseManager: DatabaseManager) {}

  /**
   * Loads all custom functions into the database.
   */
  async loadDatabaseFunctions(): Promise<void> {
    await this.databaseManager.loadFunctions()
  }

  /**
   * Cleans up the entire database.
   */
  async cleanupDatabase(): Promise<void> {
    await this.databaseManager.cleanup()
  }
}
