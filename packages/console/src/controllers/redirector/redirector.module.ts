import { DIContainer } from '@famir/common'
import { RedirectorController } from './redirector.controller.js'
import { RedirectorService } from './redirector.service.js'

export const composeRedirectorModule = (container: DIContainer) => {
  RedirectorService.inject(container)

  RedirectorController.inject(container)

  RedirectorController.resolve(container)
}
