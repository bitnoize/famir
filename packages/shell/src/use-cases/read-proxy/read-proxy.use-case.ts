import { Proxy, ProxyRepository } from '@famir/domain'
import { ReadProxyDto } from './read-proxy.js'

export class ReadProxyUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(dto: ReadProxyDto): Promise<Proxy | null> {
    return await this.proxyRepository.read(dto.id)
  }
}
