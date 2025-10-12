import { DIContainer } from '@famir/common'
import { CompleteController } from './complete.controller.js'
import { CompleteUseCase } from './use-cases/index.js'

export const composeComplete = (container: DIContainer) => {
  CompleteUseCase.inject(container)

  CompleteController.inject(container)

  CompleteController.resolve(container)
}
