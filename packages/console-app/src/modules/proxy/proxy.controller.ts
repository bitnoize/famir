import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  PROXY_CONTROLLER,
  PROXY_SERVICE,
  ReadProxyData,
  ToggleProxyData,
} from './proxy.js'
import { proxySchemas } from './proxy.schemas.js'
import { type ProxyService } from './proxy.service.js'

/**
 * Represents a proxy controller
 *
 * @category Proxy
 */
export class ProxyController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProxyController>(
      PROXY_CONTROLLER,
      (c) =>
        new ProxyController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(PROXY_SERVICE)
        )
    )
  }

  /**
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
      this.validateData<ToggleProxyData>('console-toggle-proxy-data', data)

      return await this.proxyService.enable(data)
    })

    this.router.addApiCall('disableProxy', async (data) => {
      this.validateData<ToggleProxyData>('console-toggle-proxy-data', data)

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
