import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
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

    this.router.register('createProxy', this.createProxy)
    this.router.register('readProxy', this.readProxy)
    this.router.register('enableProxy', this.enableProxy)
    this.router.register('disableProxy', this.disableProxy)
    this.router.register('deleteProxy', this.deleteProxy)
    this.router.register('listProxies', this.listProxies)

    this.logger.debug(`MessageController initialized`)
  }

  private createProxy: ReplServerApiCall = async (data) => {
    this.validateData<CreateProxyData>('console-create-proxy-data', data)

    await this.proxyService.create(data)

    return true
  }

  private readProxy: ReplServerApiCall = async (data) => {
    this.validateData<ReadProxyData>('console-read-proxy-data', data)

    return await this.proxyService.read(data)
  }

  private enableProxy: ReplServerApiCall = async (data) => {
    this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

    await this.proxyService.enable(data)

    return true
  }

  private disableProxy: ReplServerApiCall = async (data) => {
    this.validateData<SwitchProxyData>('console-switch-proxy-data', data)

    await this.proxyService.disable(data)

    return true
  }

  private deleteProxy: ReplServerApiCall = async (data) => {
    this.validateData<DeleteProxyData>('console-delete-proxy-data', data)

    await this.proxyService.delete(data)

    return true
  }

  private listProxies: ReplServerApiCall = async (data) => {
    this.validateData<ListProxiesData>('console-list-proxies-data', data)

    return await this.proxyService.list(data)
  }
}
