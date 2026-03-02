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
import { FindLureRedirectorData } from './find-lure-redirector.js'

export const FIND_LURE_REDIRECTOR_USE_CASE = Symbol('FindLureRedirectorUseCase')

export class FindLureRedirectorUseCase {
  static inject(container: DIContainer) {
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

  async execute(
    data: FindLureRedirectorData
  ): Promise<[EnabledLureModel, FullRedirectorModel] | null> {
    const lure = await this.lureRepository.find(data.campaignId, data.path)

    if (!(lure && LureModel.isEnabled(lure))) {
      return null
    }

    const redirector = await this.redirectorRepository.read(lure.campaignId, lure.redirectorId)

    if (!redirector) {
      throw new HttpServerError(`Redirector not found`, {
        code: 'NOT_FOUND'
      })
    }

    return [lure, redirector]
  }
}
