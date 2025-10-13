import { DIContainer } from '@famir/common'
import {
  ListLureModels,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReplServerError
} from '@famir/domain'

export const LIST_LURES_USE_CASE = Symbol('ListLuresUseCase')

export class ListLuresUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListLuresUseCase>(
      LIST_LURES_USE_CASE,
      (c) => new ListLuresUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  async execute(data: ListLureModels): Promise<LureModel[]> {
    const lures = await this.lureRepository.list(data)

    if (!lures) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lures
  }
}
