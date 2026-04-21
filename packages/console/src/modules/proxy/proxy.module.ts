import { DIComposer } from '@famir/common'
import { ProxyController } from './proxy.controller.js'
import { ProxyService } from './proxy.service.js'

/**
 * @category Proxy
 */
export const composeProxy: DIComposer = (container) => {
  ProxyService.register(container)

  ProxyController.register(container)
}
