import { DIContainer } from '@famir/common'
import {
  createProxyDataSchema,
  deleteProxyDataSchema,
  listProxiesDataSchema,
  readProxyDataSchema,
  switchProxyDataSchema
} from '@famir/database'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  Logger,
  LOGGER,
  ReadProxyData,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  SwitchProxyData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { PROXY_SERVICE, type ProxyService } from './proxy.service.js'

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
    super(validator, logger, router, 'proxy')

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

    this.logger.debug(`ProxyController initialized`)
  }

  private createProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateCreateProxyData(data)

      return await this.proxyService.createProxy(data)
    } catch (error) {
      this.handleException(error, 'createProxy', data)
    }
  }

  private readProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadProxyData(data)

      return await this.proxyService.readProxy(data)
    } catch (error) {
      this.handleException(error, 'readProxy', data)
    }
  }

  private enableProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchProxyData(data)

      return await this.proxyService.enableProxy(data)
    } catch (error) {
      this.handleException(error, 'enableProxy', data)
    }
  }

  private disableProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateSwitchProxyData(data)

      return await this.proxyService.disableProxy(data)
    } catch (error) {
      this.handleException(error, 'disableProxy', data)
    }
  }

  private deleteProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateDeleteProxyData(data)

      return await this.proxyService.deleteProxy(data)
    } catch (error) {
      this.handleException(error, 'deleteProxy', data)
    }
  }

  private listProxiesApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateListProxiesData(data)

      return await this.proxyService.listProxies(data)
    } catch (error) {
      this.handleException(error, 'listProxies', data)
    }
  }

  private validateCreateProxyData(value: unknown): asserts value is CreateProxyData {
    try {
      this.validator.assertSchema<CreateProxyData>('console-create-proxy-data', value)
    } catch (error) {
      throw new ReplServerError(`CreateProxyData validation failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateReadProxyData(value: unknown): asserts value is ReadProxyData {
    try {
      this.validator.assertSchema<ReadProxyData>('console-read-proxy-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadProxyData validation failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateSwitchProxyData(value: unknown): asserts value is SwitchProxyData {
    try {
      this.validator.assertSchema<SwitchProxyData>('console-switch-proxy-data', value)
    } catch (error) {
      throw new ReplServerError(`SwitchProxyData validation failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateDeleteProxyData(value: unknown): asserts value is DeleteProxyData {
    try {
      this.validator.assertSchema<DeleteProxyData>('console-delete-proxy-data', value)
    } catch (error) {
      throw new ReplServerError(`DeleteProxyData validation failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateListProxiesData(value: unknown): asserts value is ListProxiesData {
    try {
      this.validator.assertSchema<ListProxiesData>('console-list-proxies-data', value)
    } catch (error) {
      throw new ReplServerError(`ListProxiesData validation failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}

export const PROXY_CONTROLLER = Symbol('ProxyController')
