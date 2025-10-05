import { DIContainer } from '@famir/common'
import { ListLuresData, LURE_REPOSITORY, LureModel, LureRepository } from '@famir/domain'

export const LIST_LURES_USE_CASE = Symbol('ListLuresUseCase')

export class ListLuresUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListLuresUseCase>(
      LIST_LURES_USE_CASE,
      (c) => new ListLuresUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  async execute(data: ListLuresData): Promise<LureModel[] | null> {
    return await this.lureRepository.list(data)
  }
}
