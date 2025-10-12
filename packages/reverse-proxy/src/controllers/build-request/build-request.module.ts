import { DIContainer } from '@famir/common'
import { BuildRequestController } from './build-request.controller.js'
import { BuildRequestUseCase } from './use-cases/index.js'

export const composeBuildRequest = (container: DIContainer) => {
  BuildRequestUseCase.inject(container)

  BuildRequestController.inject(container)

  BuildRequestController.resolve(container)
}
