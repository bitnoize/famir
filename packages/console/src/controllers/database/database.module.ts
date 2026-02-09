import { DIContainer } from '@famir/common'
import { DatabaseController } from './database.controller.js'
import { DatabaseService } from './database.service.js'

export const composeDatabaseModule = (container: DIContainer): DatabaseController => {
  DatabaseService.inject(container)

  DatabaseController.inject(container)

  return DatabaseController.resolve(container)
}
