import { DIContainer } from '@famir/common'
import { BuildResponseController } from './build-response.controller.js'
import { BuildResponseService } from './build-response.service.js'

export const composeBuildResponseModule = (container: DIContainer) => {
  BuildResponseService.inject(container)

  BuildResponseController.inject(container)

  BuildResponseController.resolve(container).addMiddlewares()
}
