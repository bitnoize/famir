import { DIContainer } from '@famir/common'
import { EnabledLureModel, LURE_REPOSITORY, LureModel, LureRepository } from '@famir/database'
import { FIND_LURE_USE_CASE, FindLureData } from './find-lure.js'

/*
 * Find lure use-case
 */
export class FindLureUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<FindLureUseCase>(
      FIND_LURE_USE_CASE,
      (c) => new FindLureUseCase(c.resolve<LureRepository>(LURE_REPOSITORY))
    )
  }

  constructor(protected readonly lureRepository: LureRepository) {}

  /*
   * Execute use-case
   */
  async execute(data: FindLureData): Promise<EnabledLureModel | null> {
    const lure = await this.lureRepository.find(data.campaignId, data.path)

    if (!(lure && LureModel.isEnabled(lure))) {
      return null
    }

    return lure
  }
}
