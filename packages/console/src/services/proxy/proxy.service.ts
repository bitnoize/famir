import { DIContainer } from '@famir/common'
import {
  CreateProxyModel,
  DeleteProxyModel,
  DisabledProxyModel,
  EnabledProxyModel,
  ListProxyModels,
  Logger,
  LOGGER,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReadProxyModel,
  ReplServerError,
  SwitchProxyModel
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

  async create(data: CreateProxyModel): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.create(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'CONFLICT'])
    }
  }

  async read(data: ReadProxyModel): Promise<ProxyModel> {
    const proxy = await this.proxyRepository.read(data)

    if (!proxy) {
      throw new ReplServerError(`Proxy not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxy
  }

  async enable(data: SwitchProxyModel): Promise<EnabledProxyModel> {
    try {
      return await this.proxyRepository.enable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async disable(data: SwitchProxyModel): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.disable(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async delete(data: DeleteProxyModel): Promise<DisabledProxyModel> {
    try {
      return await this.proxyRepository.delete(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async list(data: ListProxyModels): Promise<ProxyModel[]> {
    const proxies = await this.proxyRepository.list(data)

    if (!proxies) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxies
  }
}
