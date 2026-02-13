import { DIContainer } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/database'
import { BaseService } from '../base/index.js'

export const DATABASE_SERVICE = Symbol('DatabaseService')

export class DatabaseService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseService>(
      DATABASE_SERVICE,
      (c) => new DatabaseService(c.resolve<DatabaseManager>(DATABASE_MANAGER))
    )
  }

  constructor(protected readonly databaseManager: DatabaseManager) {
    super()
  }

  async loadFunctions(): Promise<true> {
    await this.databaseManager.loadFunctions()

    return true
  }

  async cleanup(): Promise<true> {
    await this.databaseManager.cleanup()

    return true
  }
}
