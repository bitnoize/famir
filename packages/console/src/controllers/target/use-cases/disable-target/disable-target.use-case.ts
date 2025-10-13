import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  ReplServerError,
  SwitchTargetModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const DISABLE_TARGET_USE_CASE = Symbol('DisableTargetUseCase')

export class DisableTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DisableTargetUseCase>(
      DISABLE_TARGET_USE_CASE,
      (c) => new DisableTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND'] as const

  async execute(data: SwitchTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.disable(data)
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
