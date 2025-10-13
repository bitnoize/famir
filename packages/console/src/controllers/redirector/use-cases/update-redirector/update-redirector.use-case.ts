import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError,
  UpdateRedirectorModel
} from '@famir/domain'

export const UPDATE_REDIRECTOR_USE_CASE = Symbol('UpdateRedirectorUseCase')

export class UpdateRedirectorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<UpdateRedirectorUseCase>(
      UPDATE_REDIRECTOR_USE_CASE,
      (c) => new UpdateRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: UpdateRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.update(data)
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
