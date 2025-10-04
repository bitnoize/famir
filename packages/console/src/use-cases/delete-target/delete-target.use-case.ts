import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  DeleteTargetData,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const DELETE_TARGET_USE_CASE = Symbol('DeleteTargetUseCase')

export class DeleteTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DeleteTargetUseCase>(
      DELETE_TARGET_USE_CASE,
      (c) => new DeleteTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(data: DeleteTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'delete-target'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
