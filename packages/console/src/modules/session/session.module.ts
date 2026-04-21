import { DIComposer } from '@famir/common'
import { SessionController } from './session.controller.js'
import { SessionService } from './session.service.js'

/**
 * @category Session
 */
export const composeSession: DIComposer = (container) => {
  SessionService.register(container)

  SessionController.register(container)
}
