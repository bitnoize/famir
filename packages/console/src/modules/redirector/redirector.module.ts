import { DIComposer } from '@famir/common'
import { RedirectorController } from './redirector.controller.js'
import { RedirectorService } from './redirector.service.js'

/**
 * @category Redirector
 */
export const composeRedirector: DIComposer = (container) => {
  RedirectorService.register(container)

  RedirectorController.register(container)
}
