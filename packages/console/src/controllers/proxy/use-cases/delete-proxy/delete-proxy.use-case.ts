import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  DeleteProxyData,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError
} from '@famir/domain'

export const DELETE_PROXY_USE_CASE = Symbol('DeleteProxyUseCase')

export class DeleteProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DeleteProxyUseCase>(
      DELETE_PROXY_USE_CASE,
      (c) => new DeleteProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  async execute(data: DeleteProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'delete-proxy'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
