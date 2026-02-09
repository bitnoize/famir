import { DIContainer } from '@famir/common'
import { ProxyController } from './proxy.controller.js'
import { ProxyService } from './proxy.service.js'

export const composeProxyModule = (container: DIContainer): ProxyController => {
  ProxyService.inject(container)

  ProxyController.inject(container)

  return ProxyController.resolve(container)
}
