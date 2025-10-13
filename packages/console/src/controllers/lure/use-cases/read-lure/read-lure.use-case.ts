import { DIContainer } from '@famir/common'
import {
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureModel,
  ReplServerError
} from '@famir/domain'

export const READ_LURE_USE_CASE = Symbol('ReadLureUseCase')

export class ReadLureUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadLureUseCase>(
      READ_LURE_USE_CASE,
      (c) => new ReadLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(private readonly lureRepository: LureRepository) {}

  async execute(data: ReadLureModel): Promise<LureModel> {
    const lure = await this.lureRepository.read(data)

    if (!lure) {
      throw new ReplServerError(`Lure not found`, {
        code: 'NOT_FOUND'
      })
    }

    return lure
  }
}
