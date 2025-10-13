import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CreateRedirectorModel,
  DatabaseError,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError
} from '@famir/domain'

export const CREATE_REDIRECTOR_USE_CASE = Symbol('CreateRedirectorUseCase')

export class CreateRedirectorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateRedirectorUseCase>(
      CREATE_REDIRECTOR_USE_CASE,
      (c) => new CreateRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  private readonly knownErrorCodes = ['CONFLICT'] as const

  async execute(data: CreateRedirectorModel): Promise<RedirectorModel> {
    try {
      return await this.redirectorRepository.create(data)
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
