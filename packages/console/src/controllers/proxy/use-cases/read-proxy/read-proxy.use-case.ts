import { DIContainer } from '@famir/common'
import { PROXY_REPOSITORY, ProxyModel, ProxyRepository, ReadProxyData } from '@famir/domain'

export const READ_PROXY_USE_CASE = Symbol('ReadProxyUseCase')

export class ReadProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadProxyUseCase>(
      READ_PROXY_USE_CASE,
      (c) => new ReadProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(data: ReadProxyData): Promise<ProxyModel | null> {
    return await this.proxyRepository.read(data)
  }
}
