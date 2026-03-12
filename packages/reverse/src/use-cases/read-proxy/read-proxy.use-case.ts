import { DIContainer } from '@famir/common'
import { EnabledProxyModel, PROXY_REPOSITORY, ProxyModel, ProxyRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { ReadProxyData } from './read-proxy.js'

export const READ_PROXY_USE_CASE = Symbol('ReadProxyUseCase')

export class ReadProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadProxyUseCase>(
      READ_PROXY_USE_CASE,
      (c) => new ReadProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(protected readonly proxyRepository: ProxyRepository) {}

  async execute(data: ReadProxyData): Promise<EnabledProxyModel> {
    const proxy = await this.proxyRepository.read(data.campaignId, data.proxyId)

    if (!(proxy && ProxyModel.isEnabled(proxy))) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read proxy failed`,
          data
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return proxy
  }
}
