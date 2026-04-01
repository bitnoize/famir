import { DIContainer } from '@famir/common'
import {
  EnabledLureModel,
  FullRedirectorModel,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorRepository
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { FIND_LURE_REDIRECTOR_USE_CASE, FindLureRedirectorData } from './find-lure-redirector.js'

/*
 * Find lure redirector use-case
 */
export class FindLureRedirectorUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<FindLureRedirectorUseCase>(
      FIND_LURE_REDIRECTOR_USE_CASE,
      (c) =>
        new FindLureRedirectorUseCase(
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository
  ) {}

  /*
   * Execute use-case
   */
  async execute(
    data: FindLureRedirectorData
  ): Promise<[EnabledLureModel, FullRedirectorModel] | null> {
    const lure = await this.lureRepository.find(data.campaignId, data.path)

    if (!(lure && LureModel.isEnabled(lure))) {
      return null
    }

    const redirector = await this.redirectorRepository.readFull(lure.campaignId, lure.redirectorId)

    if (!redirector) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read redirector failed`,
          data
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return [lure, redirector]
  }
}
