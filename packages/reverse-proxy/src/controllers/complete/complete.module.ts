import { DIContainer } from '@famir/common'
import { CompleteController } from './complete.controller.js'
import { CompleteService } from './complete.service.js'

export const composeCompleteModule = (container: DIContainer) => {
  CompleteService.inject(container)

  CompleteController.inject(container)

  CompleteController.resolve(container)
}
