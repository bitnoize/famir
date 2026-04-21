import { DIComposer } from '@famir/common'
import { DatabaseController } from './database.controller.js'
import { DatabaseService } from './database.service.js'

/**
 * @category Database
 */
export const composeDatabase: DIComposer = (container) => {
  DatabaseService.register(container)

  DatabaseController.register(container)
}
