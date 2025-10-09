import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { ReadCampaignTargetData, ReadCampaignTargetResult } from './read-campaign-target.js'

export const READ_CAMPAIGN_TARGET_USE_CASE = Symbol('ReadCampaignTargetUseCase')

export class ReadCampaignTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadCampaignTargetUseCase>(
      READ_CAMPAIGN_TARGET_USE_CASE,
      (c) =>
        new ReadCampaignTargetUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: ReadCampaignTargetData): Promise<ReadCampaignTargetResult> {
    const campaign = await this.campaignRepository.read({
      campaignId: data.campaignId
    })

    if (campaign === null) {
      throw new HttpServerError(`Campaign not found`, {
        context: {
          useCase: 'read-campaign-target'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    const target = await this.targetRepository.readEnabled({
      campaignId: data.campaignId,
      targetId: data.targetId
    })

    if (target === null) {
      throw new HttpServerError(`Target not found`, {
        context: {
          useCase: 'read-campaign-target'
        },
        code: 'SERVICE_UNAVAILABLE',
        status: 503
      })
    }

    return { campaign, target }
  }
}
