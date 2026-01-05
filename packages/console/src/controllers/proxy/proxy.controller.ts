import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
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
import {
  createProxyDataSchema,
  deleteProxyDataSchema,
  listProxiesDataSchema,
  readProxyDataSchema,
  switchProxyDataSchema
} from './proxy.schemas.js'
import { PROXY_SERVICE, type ProxyService } from './proxy.service.js'

export const PROXY_CONTROLLER = Symbol('ProxyController')

export class ProxyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyController>(
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
    return container.resolve<ProxyController>(PROXY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly proxyService: ProxyService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas({
      'console-create-proxy-data': createProxyDataSchema,
      'console-read-proxy-data': readProxyDataSchema,
      'console-switch-proxy-data': switchProxyDataSchema,
      'console-delete-proxy-data': deleteProxyDataSchema,
      'console-list-proxies-data': listProxiesDataSchema
    })

    this.router.addApiCall('createProxy', this.createProxyApiCall)
    this.router.addApiCall('readProxy', this.readProxyApiCall)
    this.router.addApiCall('enableProxy', this.enableProxyApiCall)
    this.router.addApiCall('disableProxy', this.disableProxyApiCall)
    this.router.addApiCall('deleteProxy', this.deleteProxyApiCall)
    this.router.addApiCall('listProxies', this.listProxiesApiCall)

    this.logger.debug(`MessageController initialized`)
  }

  private createProxyApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<CreateProxyData>('console-create-proxy-data', data)

    return await this.proxyService.createProxy(data)
  }

  private readProxyApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ReadProxyData>('console-read-proxy-data', data)

    return await this.proxyService.readProxy(data)
  }

  private enableProxyApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<SwitchProxyData>('console-switch-proxy-data', data)

    return await this.proxyService.enableProxy(data)
  }

  private disableProxyApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<SwitchProxyData>('console-switch-proxy-data', data)

    return await this.proxyService.disableProxy(data)
  }

  private deleteProxyApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<DeleteProxyData>('console-delete-proxy-data', data)

    return await this.proxyService.deleteProxy(data)
  }

  private listProxiesApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ListProxiesData>('console-list-proxies-data', data)

    return await this.proxyService.listProxies(data)
  }
}
