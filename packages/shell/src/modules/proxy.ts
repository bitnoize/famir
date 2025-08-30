import { DIContainer } from '@famir/common'
import { ProxyRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import { ProxyController } from '../controllers/index.js'
import {
  CreateProxyUseCase,
  DeleteProxyUseCase,
  DisableProxyUseCase,
  EnableProxyUseCase,
  ListProxiesUseCase,
  ReadProxyUseCase
} from '../use-cases/index.js'

export const composeProxy = (container: DIContainer) => {
  container.registerSingleton<CreateProxyUseCase>(
    'CreateProxyUseCase',
    (c) => new CreateProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ReadProxyUseCase>(
    'ReadProxyUseCase',
    (c) => new ReadProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<EnableProxyUseCase>(
    'EnableProxyUseCase',
    (c) => new EnableProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<DisableProxyUseCase>(
    'DisableProxyUseCase',
    (c) => new DisableProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<DeleteProxyUseCase>(
    'DeleteProxyUseCase',
    (c) => new DeleteProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ListProxiesUseCase>(
    'ListProxiesUseCase',
    (c) => new ListProxiesUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ProxyController>(
    'ProxyController',
    (c) =>
      new ProxyController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context'),
        c.resolve<CreateProxyUseCase>('CreateProxyUseCase'),
        c.resolve<ReadProxyUseCase>('ReadProxyUseCase'),
        c.resolve<EnableProxyUseCase>('EnableProxyUseCase'),
        c.resolve<DisableProxyUseCase>('DisableProxyUseCase'),
        c.resolve<DeleteProxyUseCase>('DeleteProxyUseCase'),
        c.resolve<ListProxiesUseCase>('ListProxiesUseCase')
      )
  )

  container.resolve<ProxyController>('ProxyController')
}
