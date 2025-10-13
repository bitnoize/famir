import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DeleteLureModel,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError
} from '@famir/domain'

export const DELETE_LURE_USE_CASE = Symbol('DeleteLureUseCase')

export class DeleteLureUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DeleteLureUseCase>(
      DELETE_LURE_USE_CASE,
      (c) => new DeleteLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: DeleteLureModel): Promise<LureModel> {
    try {
      return await this.lureRepository.delete(data)
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
