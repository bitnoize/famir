import { DIContainer } from '@famir/common'
import {
  ListTargetModels,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const LIST_TARGETS_USE_CASE = Symbol('ListTargetsUseCase')

export class ListTargetsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListTargetsUseCase>(
      LIST_TARGETS_USE_CASE,
      (c) => new ListTargetsUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(data: ListTargetModels): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data)

    if (!targets) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return targets
  }
}
