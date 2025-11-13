import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository
} from '@famir/domain'
import { GetCampaignTargetData, GetCampaignTargetReply } from './get-campaign-target.js'

export const GET_CAMPAIGN_TARGET_USE_CASE = Symbol('GetCampaignTargetUseCase')

export class GetCampaignTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<GetCampaignTargetUseCase>(
      GET_CAMPAIGN_TARGET_USE_CASE,
      (c) =>
        new GetCampaignTargetUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: GetCampaignTargetData): Promise<GetCampaignTargetReply> {
    const [campaignModel, targetModel] = await Promise.all([
      this.campaignRepository.readCampaign({
        campaignId: data.campaignId
      }),

      this.targetRepository.readEnabledTarget({
        campaignId: data.campaignId,
        targetId: data.targetId
      })
    ])

    if (!campaignModel || !targetModel) {
      throw new HttpServerError(`Not configured backend`, {
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return {
      campaign: campaignModel,
      target: targetModel
    }
  }
}
