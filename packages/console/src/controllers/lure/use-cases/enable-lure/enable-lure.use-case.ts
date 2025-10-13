import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError,
  SwitchLureModel
} from '@famir/domain'

export const ENABLE_LURE_USE_CASE = Symbol('EnableLureUseCase')

export class EnableLureUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<EnableLureUseCase>(
      ENABLE_LURE_USE_CASE,
      (c) => new EnableLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND'] as const

  async execute(data: SwitchLureModel): Promise<LureModel> {
    try {
      return await this.lureRepository.enable(data)
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
