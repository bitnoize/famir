import { DIContainer } from '@famir/common'
import { SessionController } from './session.controller.js'
import { ReadSessionUseCase } from './use-cases/index.js'

export const composeSession = (container: DIContainer) => {
  ReadSessionUseCase.inject(container)

  SessionController.inject(container)

  SessionController.resolve(container)
}
