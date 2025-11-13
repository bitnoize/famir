import { DIContainer } from '@famir/common'
import { ProxyController } from './proxy.controller.js'
import { ProxyService } from './proxy.service.js'

export const composeProxyModule = (container: DIContainer) => {
  ProxyService.inject(container)

  ProxyController.inject(container)

  ProxyController.resolve(container)
}
