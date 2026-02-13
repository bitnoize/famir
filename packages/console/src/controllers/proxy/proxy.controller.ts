import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from './proxy.js'
import { proxySchemas } from './proxy.schemas.js'
import { PROXY_SERVICE, type ProxyService } from './proxy.service.js'

export const PROXY_CONTROLLER = Symbol('ProxyController')

export class ProxyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      PROXY_CONTROLLER,
      (c) =>
        new ProxyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<ProxyService>(PROXY_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): ProxyController {
    return container.resolve(PROXY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly proxyService: ProxyService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(proxySchemas)

    this.logger.debug(`MessageController initialized`)
  }

  use() {
    this.router.register('createProxy', async (data) => {
      this.validateData<CreateProxyData>('console-create-proxy-data', data)

      return await this.proxyService.create(data)
    })

    this.router.register('readProxy', async (data) => {
      this.validateData<ReadProxyData>('console-read-proxy-data', data)

      return await this.proxyService.read(data)
    })

    this.router.register('enableProxy', async (data) => {
      this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

      return await this.proxyService.enable(data)
    })

    this.router.register('disableProxy', async (data) => {
      this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

      return await this.proxyService.disable(data)
    })

    this.router.register('deleteProxy', async (data) => {
      this.validateData<DeleteProxyData>('console-delete-proxy-data', data)

      return await this.proxyService.delete(data)
    })

    this.router.register('listProxies', async (data) => {
      this.validateData<ListProxiesData>('console-list-proxies-data', data)

      return await this.proxyService.list(data)
    })
  }
}
