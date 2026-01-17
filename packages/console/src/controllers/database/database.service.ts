import { DIContainer } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/domain'
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

  async loadFunctions(): Promise<void> {
    await this.databaseManager.loadFunctions()
  }

  async cleanup(): Promise<void> {
    await this.databaseManager.cleanup()
  }
}
