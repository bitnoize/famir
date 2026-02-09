import { DIContainer } from '@famir/common'
import { SessionController } from './session.controller.js'
import { SessionService } from './session.service.js'

export const composeSessionModule = (container: DIContainer): SessionController => {
  SessionService.inject(container)

  SessionController.inject(container)

  return SessionController.resolve(container)
}
