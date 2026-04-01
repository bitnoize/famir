import { DIContainer } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/database'
import { DATABASE_SERVICE } from './database.js'

/*
 * Database service
 */
export class DatabaseService {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseService>(
      DATABASE_SERVICE,
      (c) => new DatabaseService(c.resolve<DatabaseManager>(DATABASE_MANAGER))
    )
  }

  constructor(protected readonly databaseManager: DatabaseManager) {}

  /*
   * Load database functions
   */
  async loadDatabaseFunctions(): Promise<true> {
    await this.databaseManager.loadFunctions()

    return true
  }

  /*
   * Cleanup database
   */
  async cleanupDatabase(): Promise<true> {
    await this.databaseManager.cleanup()

    return true
  }
}
