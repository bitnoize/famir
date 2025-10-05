import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  DeleteRedirectorData,
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

  async execute(data: DeleteRedirectorData): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'delete-redirector'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
