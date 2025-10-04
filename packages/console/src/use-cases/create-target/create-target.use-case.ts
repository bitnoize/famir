import { DIContainer } from '@famir/common'
import {
  CreateTargetData,
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

  async execute(data: CreateTargetData): Promise<TargetModel> {
    try {
      return await this.targetRepository.create(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['CONFLICT'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'create-target'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
