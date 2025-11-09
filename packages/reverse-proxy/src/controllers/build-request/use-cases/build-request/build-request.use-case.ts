import { DIContainer, randomIdent } from '@famir/common'
import {
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { BuildRequestData, BuildRequestResult } from './build-request.js'

export const BUILD_REQUEST_USE_CASE = Symbol('BuildRequestUseCase')

export class BuildRequestUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<BuildRequestUseCase>(
      BUILD_REQUEST_USE_CASE,
      (c) => new BuildRequestUseCase(
        c.resolve<TargetRepository>(TARGET_REPOSITORY),
      )
    )
  }

  constructor(
    protected readonly targetRepository: TargetRepository,
  ) {}

  async execute(data: BuildRequestData): Promise<BuildRequestResult> {
    const { campaign, target, session } = data

    const targets = await this.targetRepository.listEnabled({
      campaignId: campaign.campaignId
    })

    if (!targets) {
      throw new HttpServerError(`Campaign lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return { targets }
  }
}
