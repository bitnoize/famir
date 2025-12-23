import { DIContainer } from '@famir/common'
import { DatabaseController } from './database.controller.js'
import { DatabaseService } from './database.service.js'

export const composeDatabaseModule = (container: DIContainer) => {
  DatabaseService.inject(container)

  DatabaseController.inject(container)

  DatabaseController.resolve(container)
}
