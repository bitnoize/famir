import { ProxyRepository } from '@famir/domain'
import { CreateProxyDto } from './create-proxy.js'

export class CreateProxyUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(dto: CreateProxyDto): Promise<true> {
    await this.proxyRepository.create(dto.id, dto.url)

    return true
  }
}
