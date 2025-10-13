import { DIContainer } from '@famir/common'
import {
  ListRedirectorModels,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository,
  ReplServerError
} from '@famir/domain'

export const LIST_REDIRECTORS_USE_CASE = Symbol('ListRedirectorsUseCase')

export class ListRedirectorsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListRedirectorsUseCase>(
      LIST_REDIRECTORS_USE_CASE,
      (c) => new ListRedirectorsUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly redirectorRepository: RedirectorRepository) {}

  async execute(data: ListRedirectorModels): Promise<RedirectorModel[]> {
    const redirectors = await this.redirectorRepository.list(data)

    if (!redirectors) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return redirectors
  }
}
