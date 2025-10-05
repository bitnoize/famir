import { DIContainer } from '@famir/common'
import { ProxyController } from './proxy.controller.js'
import {
  CreateProxyUseCase,
  DeleteProxyUseCase,
  DisableProxyUseCase,
  EnableProxyUseCase,
  ListProxiesUseCase,
  ReadProxyUseCase
} from './use-cases/index.js'

export const composeProxy = (container: DIContainer) => {
  CreateProxyUseCase.inject(container)
  ReadProxyUseCase.inject(container)
  EnableProxyUseCase.inject(container)
  DisableProxyUseCase.inject(container)
  DeleteProxyUseCase.inject(container)
  ListProxiesUseCase.inject(container)

  ProxyController.inject(container)

  ProxyController.resolve(container)
}
