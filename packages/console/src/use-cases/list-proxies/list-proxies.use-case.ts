import { DIContainer } from '@famir/common'
import { ListProxiesData, PROXY_REPOSITORY, ProxyModel, ProxyRepository } from '@famir/domain'

export const LIST_PROXIES_USE_CASE = Symbol('ListProxiesUseCase')

export class ListProxiesUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListProxiesUseCase>(
      LIST_PROXIES_USE_CASE,
      (c) => new ListProxiesUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(data: ListProxiesData): Promise<ProxyModel[] | null> {
    return await this.proxyRepository.list(data)
  }
}
