import { Proxy, ProxyRepository } from '@famir/domain'

export class ListProxiesUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(): Promise<Proxy[] | null> {
    return await this.proxyRepository.list()
  }
}
