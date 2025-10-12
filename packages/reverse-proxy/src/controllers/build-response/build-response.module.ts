import { DIContainer } from '@famir/common'
import { BuildResponseController } from './build-response.controller.js'
import { BuildResponseUseCase } from './use-cases/index.js'

export const composeBuildResponse = (container: DIContainer) => {
  BuildResponseUseCase.inject(container)

  BuildResponseController.inject(container)

  BuildResponseController.resolve(container)
}
