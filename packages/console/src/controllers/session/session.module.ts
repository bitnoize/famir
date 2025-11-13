import { DIContainer } from '@famir/common'
import { SessionController } from './session.controller.js'
import { SessionService } from './session.service.js'

export const composeSessionModule = (container: DIContainer) => {
  SessionService.inject(container)

  SessionController.inject(container)

  SessionController.resolve(container)
}
