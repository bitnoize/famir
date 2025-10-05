import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  ReplServerError,
  SwitchTargetData,
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

  async execute(data: SwitchTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.disable(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'disable-target'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
