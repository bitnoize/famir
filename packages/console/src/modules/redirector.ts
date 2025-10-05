import { DIContainer } from '@famir/common'
import { RedirectorController } from '../controllers/index.js'
import {
  CreateRedirectorUseCase,
  DeleteRedirectorUseCase,
  ListRedirectorsUseCase,
  ReadRedirectorUseCase,
  UpdateRedirectorUseCase
} from '../use-cases/index.js'

export const composeRedirector = (container: DIContainer) => {
  CreateRedirectorUseCase.inject(container)
  ReadRedirectorUseCase.inject(container)
  UpdateRedirectorUseCase.inject(container)
  DeleteRedirectorUseCase.inject(container)
  ListRedirectorsUseCase.inject(container)

  RedirectorController.inject(container)

  RedirectorController.resolve(container)
}
