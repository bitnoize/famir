import { DIContainer } from '@famir/common'
import {
  ReadRedirectorModel,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError
} from '@famir/domain'

export const READ_REDIRECTOR_USE_CASE = Symbol('ReadRedirectorUseCase')

export class ReadRedirectorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadRedirectorUseCase>(
      READ_REDIRECTOR_USE_CASE,
      (c) => new ReadRedirectorUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  async execute(data: ReadRedirectorModel): Promise<RedirectorModel> {
    const redirector = await this.redirectorRepository.read(data)

    if (!redirector) {
      throw new ReplServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirector
  }
}
