import { DIContainer } from '@famir/common'
import { PROXY_REPOSITORY, ProxyModel, ProxyRepository, ReplServerError } from '@famir/domain'
import { BaseService } from '../base/index.js'
import {
  CreateProxyData,
  DeleteProxyData,
  ListProxiesData,
  ReadProxyData,
  SwitchProxyData
} from './proxy.js'

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
      return await this.proxyRepository.create(data.campaignId, data.proxyId, data.url)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async readProxy(data: ReadProxyData): Promise<ProxyModel> {
    const model = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!model) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async enableProxy(data: SwitchProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.enable(data.campaignId, data.proxyId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disableProxy(data: SwitchProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.disable(data.campaignId, data.proxyId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteProxy(data: DeleteProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.delete(data.campaignId, data.proxyId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listProxies(data: ListProxiesData): Promise<ProxyModel[]> {
    const collection = await this.proxyRepository.list(data.campaignId)

    if (!collection) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return collection
  }
}
