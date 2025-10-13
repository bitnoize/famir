import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DeleteProxyModel,
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

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: DeleteProxyModel): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = arrayIncludes(this.knownErrorCodes, error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
