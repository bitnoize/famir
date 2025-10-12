import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { SetupMirrorData, SetupMirrorResult } from './setup-mirror.js'

export const SETUP_MIRROR_USE_CASE = Symbol('SetupMirrorUseCase')

export class SetupMirrorUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<SetupMirrorUseCase>(
      SETUP_MIRROR_USE_CASE,
      (c) =>
        new SetupMirrorUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: SetupMirrorData): Promise<SetupMirrorResult> {
    const { headers } = data

    const campaign = await this.campaignRepository.read({
      campaignId: headers.campaignId
    })

    if (!campaign) {
      throw new HttpServerError(`Campaign not found`, {
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    const target = await this.targetRepository.readEnabled({
      campaignId: headers.campaignId,
      targetId: headers.targetId
    })

    if (!target) {
      throw new HttpServerError(`Target not found`, {
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    return { campaign, target }
  }
}
