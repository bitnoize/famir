import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError,
  SwitchProxyModel
} from '@famir/domain'

export const DISABLE_PROXY_USE_CASE = Symbol('DisableProxyUseCase')

export class DisableProxyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DisableProxyUseCase>(
      DISABLE_PROXY_USE_CASE,
      (c) => new DisableProxyUseCase(c.resolve<ProxyRepository>(PROXY_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: ProxyRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND'] as const

  async execute(data: SwitchProxyModel): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.disable(data)
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
