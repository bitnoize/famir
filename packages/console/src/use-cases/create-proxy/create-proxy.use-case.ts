import { DIContainer } from '@famir/common'
import {
  CreateProxyData,
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

  async execute(data: CreateProxyData): Promise<ProxyModel> {
    try {
      return await this.proxyRepository.create(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['CONFLICT'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'create-proxy'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
