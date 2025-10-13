import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CreateTargetModel,
  DatabaseError,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const CREATE_TARGET_USE_CASE = Symbol('CreateTargetUseCase')

export class CreateTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateTargetUseCase>(
      CREATE_TARGET_USE_CASE,
      (c) => new CreateTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  private readonly knownErrorCodes = ['CONFLICT'] as const

  async execute(data: CreateTargetModel): Promise<TargetModel> {
    try {
      return await this.targetRepository.create(data)
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
