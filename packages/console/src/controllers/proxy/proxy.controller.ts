import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  PROXY_SERVICE,
  ReadProxyData,
  SwitchProxyData,
  type ProxyService
} from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { PROXY_CONTROLLER } from './proxy.js'
import { proxySchemas } from './proxy.schemas.js'

/*
 * Proxy controller
 */
export class ProxyController extends BaseController {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
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

  /*
   * Resolve dependency
   */
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

  /*
   * Use api-calls
   */
  use() {
    this.router.addApiCall('createProxy', async (data) => {
      this.validateData<CreateProxyData>('console-create-proxy-data', data)

      return await this.proxyService.create(data)
    })

    this.router.addApiCall('readProxy', async (data) => {
      this.validateData<ReadProxyData>('console-read-proxy-data', data)

      return await this.proxyService.read(data)
    })

    this.router.addApiCall('enableProxy', async (data) => {
      this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

      return await this.proxyService.enable(data)
    })

    this.router.addApiCall('disableProxy', async (data) => {
      this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

      return await this.proxyService.disable(data)
    })

    this.router.addApiCall('deleteProxy', async (data) => {
      this.validateData<DeleteProxyData>('console-delete-proxy-data', data)

      return await this.proxyService.delete(data)
    })

    this.router.addApiCall('listProxies', async (data) => {
      this.validateData<ListProxiesData>('console-list-proxies-data', data)

      return await this.proxyService.list(data)
    })
  }
}
