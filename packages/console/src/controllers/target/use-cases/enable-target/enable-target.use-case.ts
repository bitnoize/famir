import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  ReplServerError,
  SwitchTargetModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const ENABLE_TARGET_USE_CASE = Symbol('EnableTargetUseCase')

export class EnableTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<EnableTargetUseCase>(
      ENABLE_TARGET_USE_CASE,
      (c) => new EnableTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(data: SwitchTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.enable(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'enable-target'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
