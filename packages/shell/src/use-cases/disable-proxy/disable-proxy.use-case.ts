import { ProxyRepository } from '@famir/domain'
import { DisableProxyDto } from './disable-proxy.js'

export class DisableProxyUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(dto: DisableProxyDto): Promise<true> {
    await this.proxyRepository.disable(dto.id)

    return true
  }
}
