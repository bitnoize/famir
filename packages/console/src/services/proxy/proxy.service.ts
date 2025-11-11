import { DIContainer } from '@famir/common'
import {
  CreateProxyData,
  DeleteProxyData,
  DisabledProxyModel,
  EnabledProxyModel,
  ListProxiesData,
  Logger,
  LOGGER,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReadProxyData,
  ReplServerError,
  SwitchProxyData
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const PROXY_SERVICE = Symbol('ProxyService')

export class ProxyService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<ProxyService>(
      PROXY_SERVICE,
      (c) =>
        new ProxyService(c.resolve<Logger>(LOGGER), c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(
    logger: Logger,
    protected readonly proxyRepository: ProxyRepository
  ) {
    super(logger)

    this.logger.debug(`ProxyService initialized`)
  }

  async createProxy(data: CreateProxyData): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.createProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readProxy(data: ReadProxyData): Promise<ProxyModel> {
    const proxy = await this.proxyRepository.readProxy(data)

    if (!proxy) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxy
  }

  async enableProxy(data: SwitchProxyData): Promise<EnabledProxyModel> {
    try {
      return await this.proxyRepository.enableProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableProxy(data: SwitchProxyData): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.disableProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteProxy(data: DeleteProxyData): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.deleteProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listProxies(data: ListProxiesData): Promise<ProxyModel[]> {
    const proxyCollection = await this.proxyRepository.listProxies(data)

    if (!proxyCollection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxyCollection
  }
}
