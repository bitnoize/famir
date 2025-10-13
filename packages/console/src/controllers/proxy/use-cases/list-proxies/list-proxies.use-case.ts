import { DIContainer } from '@famir/common'
import {
  ListProxyModels,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError
} from '@famir/domain'

export const LIST_PROXIES_USE_CASE = Symbol('ListProxiesUseCase')

export class ListProxiesUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListProxiesUseCase>(
      LIST_PROXIES_USE_CASE,
      (c) => new ListProxiesUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(data: ListProxyModels): Promise<ProxyModel[]> {
    const proxies = await this.proxyRepository.list(data)

    if (!proxies) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return proxies
  }
}
