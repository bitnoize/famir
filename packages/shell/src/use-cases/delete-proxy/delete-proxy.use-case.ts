import { ProxyRepository } from '@famir/domain'
import { DeleteProxyDto } from './delete-proxy.js'

export class DeleteProxyUseCase {
  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(dto: DeleteProxyDto): Promise<true> {
    await this.proxyRepository.delete(dto.id)

    return true
  }
}
