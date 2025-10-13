import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CreateProxyModel,
  DatabaseError,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError
} from '@famir/domain'

export const CREATE_PROXY_USE_CASE = Symbol('CreateProxyUseCase')

export class CreateProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateProxyUseCase>(
      CREATE_PROXY_USE_CASE,
      (c) => new CreateProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  private readonly knownErrorCodes = ['CONFLICT'] as const

  async execute(data: CreateProxyModel): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.create(data)
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
