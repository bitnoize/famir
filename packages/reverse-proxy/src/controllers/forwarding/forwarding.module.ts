import { DIContainer } from '@famir/common'
import { ForwardingController } from './forwarding.controller.js'
import { ForwardingService } from './forwarding.service.js'

export const composeForwardingModule = (container: DIContainer): ForwardingController => {
  ForwardingService.inject(container)

  ForwardingController.inject(container)

  return ForwardingController.resolve(container)
}
