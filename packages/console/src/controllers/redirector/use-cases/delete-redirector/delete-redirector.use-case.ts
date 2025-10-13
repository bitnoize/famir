import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DeleteRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError
} from '@famir/domain'

export const DELETE_REDIRECTOR_USE_CASE = Symbol('DeleteRedirectorUseCase')

export class DeleteRedirectorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DeleteRedirectorUseCase>(
      DELETE_REDIRECTOR_USE_CASE,
      (c) => new DeleteRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: DeleteRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.delete(data)
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
