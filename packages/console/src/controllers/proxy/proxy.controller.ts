import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerRegistry,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { PROXY_SERVICE, ProxyService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateProxyModel,
  validateDeleteProxyModel,
  validateListProxyModels,
  validateReadProxyModel,
  validateSwitchProxyModel
} from './proxy.utils.js'

export const PROXY_CONTROLLER = Symbol('ProxyController')

export class ProxyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyController>(
      PROXY_CONTROLLER,
      (c) =>
        new ProxyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
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
    registry: ReplServerRegistry,
    protected readonly proxyService: ProxyService
  ) {
    super(validator, logger, 'proxy')

    validator.addSchemas(addSchemas)

    registry.addApiCall('createProxy', this.createProxyApiCall)
    registry.addApiCall('readProxy', this.readProxyApiCall)
    registry.addApiCall('enableProxy', this.enableProxyApiCall)
    registry.addApiCall('disableProxy', this.disableProxyApiCall)
    registry.addApiCall('deleteProxy', this.deleteProxyApiCall)
    registry.addApiCall('listProxies', this.listProxiesApiCall)

    this.logger.debug(`ProxyController initialized`)
  }

  private readonly createProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      validateCreateProxyModel(this.assertSchema, data)

      return await this.proxyService.create(data)
    } catch (error) {
      this.handleException(error, 'createProxy', data)
    }
  }

  private readonly readProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadProxyModel(this.assertSchema, data)

      return await this.proxyService.read(data)
    } catch (error) {
      this.handleException(error, 'readProxy', data)
    }
  }

  private readonly enableProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchProxyModel(this.assertSchema, data)

      return await this.proxyService.enable(data)
    } catch (error) {
      this.handleException(error, 'enableProxy', data)
    }
  }

  private readonly disableProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      validateSwitchProxyModel(this.assertSchema, data)

      return await this.proxyService.disable(data)
    } catch (error) {
      this.handleException(error, 'disableProxy', data)
    }
  }

  private readonly deleteProxyApiCall: ReplServerApiCall = async (data) => {
    try {
      validateDeleteProxyModel(this.assertSchema, data)

      return await this.proxyService.delete(data)
    } catch (error) {
      this.handleException(error, 'deleteProxy', data)
    }
  }

  private readonly listProxiesApiCall: ReplServerApiCall = async (data) => {
    try {
      validateListProxyModels(this.assertSchema, data)

      return await this.proxyService.list(data)
    } catch (error) {
      this.handleException(error, 'listProxies', data)
    }
  }
}
