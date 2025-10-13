import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  UpdateTargetModel
} from '@famir/domain'

export const UPDATE_TARGET_USE_CASE = Symbol('UpdateTargetUseCase')

export class UpdateTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<UpdateTargetUseCase>(
      UPDATE_TARGET_USE_CASE,
      (c) => new UpdateTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: UpdateTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.update(data)
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
