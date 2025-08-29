import { ProxyRepository } from '@famir/domain'
import { EnableProxyDto } from './enable-proxy.js'

export class EnableProxyUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(dto: EnableProxyDto): Promise<true> {
    await this.proxyRepository.enable(dto.id)

    return true
  }
}
