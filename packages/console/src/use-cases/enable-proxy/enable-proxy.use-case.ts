import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  PROXY_REPOSITORY,
  ProxyModel,
  ProxyRepository,
  ReplServerError,
  SwitchProxyData
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

  async execute(data: SwitchProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.enable(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'enable-proxy'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
