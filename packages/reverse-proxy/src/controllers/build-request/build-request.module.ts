import { DIContainer } from '@famir/common'
import { BuildRequestController } from './build-request.controller.js'

export const composeBuildRequestModule = (container: DIContainer) => {
  BuildRequestController.inject(container)

  BuildRequestController.resolve(container)
}
