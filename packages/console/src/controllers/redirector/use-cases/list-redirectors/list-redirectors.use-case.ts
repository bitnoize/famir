import { DIContainer } from '@famir/common'
import {
  ListRedirectorsData,
  REDIRECTOR_REPOSITORY,
  RedirectorModel,
  RedirectorRepository
} from '@famir/domain'

export const LIST_REDIRECTORS_USE_CASE = Symbol('ListRedirectorsUseCase')

export class ListRedirectorsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListRedirectorsUseCase>(
      LIST_REDIRECTORS_USE_CASE,
      (c) => new ListRedirectorsUseCase(c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: RedirectorRepository) {}

  async execute(data: ListRedirectorsData): Promise<RedirectorModel[] | null> {
    return await this.proxyRepository.list(data)
  }
}
