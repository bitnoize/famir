import { DIContainer } from '@famir/common'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
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
      (c) => new ProxyService(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(protected readonly proxyRepository: ProxyRepository) {
    super()
  }

  async createProxy(data: CreateProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.createProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readProxy(data: ReadProxyData): Promise<ProxyModel> {
    const proxyModel = await this.proxyRepository.readProxy(data)

    if (!proxyModel) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxyModel
  }

  async enableProxy(data: SwitchProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.enableProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableProxy(data: SwitchProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.disableProxy(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteProxy(data: DeleteProxyData): Promise<ProxyModel> {
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
