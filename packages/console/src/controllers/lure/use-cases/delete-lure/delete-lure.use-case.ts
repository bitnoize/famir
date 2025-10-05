import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  DeleteLureData,
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

  async execute(data: DeleteLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'delete-lure'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
