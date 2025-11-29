import { DIContainer } from '@famir/common'
import { BuildResponseController } from './build-response.controller.js'

export const composeBuildResponseModule = (container: DIContainer) => {
  BuildResponseController.inject(container)

  BuildResponseController.resolve(container)
}
