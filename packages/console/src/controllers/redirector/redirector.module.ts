import { DIContainer } from '@famir/common'
import { RedirectorController } from './redirector.controller.js'
import { RedirectorService } from './redirector.service.js'

export const composeRedirectorModule = (container: DIContainer): RedirectorController => {
  RedirectorService.inject(container)

  RedirectorController.inject(container)

  return RedirectorController.resolve(container)
}
