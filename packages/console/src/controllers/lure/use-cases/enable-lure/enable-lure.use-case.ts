import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError,
  SwitchLureData
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

  async execute(data: SwitchLureData): Promise<LureModel> {
    try {
      return await this.lureRepository.enable(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'enable-lure'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
