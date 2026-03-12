import { DIContainer, randomIdent } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { ActionDatabaseData } from './database.js'

export const DATABASE_SERVICE = Symbol('DatabaseService')

export class DatabaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<DatabaseService>(
      DATABASE_SERVICE,
      (c) => new DatabaseService(c.resolve<DatabaseManager>(DATABASE_MANAGER))
    )
  }

  protected confirmSecret: string

  constructor(protected readonly databaseManager: DatabaseManager) {
    this.confirmSecret = randomIdent()
  }

  async loadDatabaseFunctions(data: ActionDatabaseData): Promise<true> {
    this.checkConfirmSecret(data.confirmSecret)

    await this.databaseManager.loadFunctions()

    return true
  }

  async cleanupDatabase(data: ActionDatabaseData): Promise<true> {
    this.checkConfirmSecret(data.confirmSecret)

    await this.databaseManager.cleanup()

    return true
  }

  protected checkConfirmSecret(confirmSecret: string | undefined) {
    if (!(confirmSecret && confirmSecret === this.confirmSecret)) {
      throw new ReplServerError(`Database action canceled`, {
        context: {
          reason: `Confirm secret not provided or not match`,
          confirmSecret: this.confirmSecret
        },
        code: 'FORBIDDEN'
      })
    }

    this.confirmSecret = randomIdent()
  }
}
