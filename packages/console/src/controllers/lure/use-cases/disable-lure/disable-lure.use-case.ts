import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError,
  SwitchLureModel
} from '@famir/domain'

export const DISABLE_LURE_USE_CASE = Symbol('DisableLureUseCase')

export class DisableLureUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DisableLureUseCase>(
      DISABLE_LURE_USE_CASE,
      (c) => new DisableLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  async execute(data: SwitchLureModel): Promise<LureModel> {
    try {
      return await this.lureRepository.disable(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'disable-lure'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
