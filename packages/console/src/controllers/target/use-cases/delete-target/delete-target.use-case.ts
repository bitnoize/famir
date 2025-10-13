import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DeleteTargetModel,
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

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: DeleteTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.delete(data)
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
