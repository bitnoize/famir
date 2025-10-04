import { DIContainer } from '@famir/common'
import { ListTargetsData, TARGET_REPOSITORY, TargetModel, TargetRepository } from '@famir/domain'

export const LIST_TARGETS_USE_CASE = Symbol('ListTargetsUseCase')

export class ListTargetsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListTargetsUseCase>(
      LIST_TARGETS_USE_CASE,
      (c) => new ListTargetsUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly proxyRepository: TargetRepository) {}

  async execute(data: ListTargetsData): Promise<TargetModel[] | null> {
    return await this.proxyRepository.list(data)
  }
}
