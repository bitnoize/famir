import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError,
  SwitchProxyModel
} from '@famir/domain'

export const ENABLE_PROXY_USE_CASE = Symbol('EnableProxyUseCase')

export class EnableProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<EnableProxyUseCase>(
      ENABLE_PROXY_USE_CASE,
      (c) => new EnableProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND'] as const

  async execute(data: SwitchProxyModel): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.enable(data)
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
