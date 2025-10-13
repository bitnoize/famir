import { DIContainer } from '@famir/common'
import {
  ReadTargetModel,
  ReplServerError,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/domain'

export const READ_TARGET_USE_CASE = Symbol('ReadTargetUseCase')

export class ReadTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadTargetUseCase>(
      READ_TARGET_USE_CASE,
      (c) => new ReadTargetUseCase(c.resolve<TargetRepository>(TARGET_REPOSITORY))
    )
  }

  constructor(private readonly targetRepository: TargetRepository) {}

  async execute(data: ReadTargetModel): Promise<TargetModel> {
    const target = await this.targetRepository.read(data)

    if (!target) {
      throw new ReplServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    return target
  }
}
