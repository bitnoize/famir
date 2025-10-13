import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CreateLureModel,
  DatabaseError,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError
} from '@famir/domain'

export const CREATE_LURE_USE_CASE = Symbol('CreateLureUseCase')

export class CreateLureUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateLureUseCase>(
      CREATE_LURE_USE_CASE,
      (c) => new CreateLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  private readonly knownErrorCodes = ['CONFLICT'] as const

  async execute(data: CreateLureModel): Promise<LureModel> {
    try {
      return await this.lureRepository.create(data)
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
