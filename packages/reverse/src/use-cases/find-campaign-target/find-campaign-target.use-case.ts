import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  EnabledFullTargetModel,
  EnabledTargetModel,
  FullCampaignModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { FIND_CAMPAIGN_TARGET_USE_CASE, FindCampaignTargetData } from './find-campaign-target.js'

export class FindCampaignTargetUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<FindCampaignTargetUseCase>(
      FIND_CAMPAIGN_TARGET_USE_CASE,
      (c) =>
        new FindCampaignTargetUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(
    data: FindCampaignTargetData
  ): Promise<[FullCampaignModel, EnabledFullTargetModel, EnabledTargetModel[]]> {
    const target = await this.targetRepository.findFull(data.mirrorHost)

    if (!(target && TargetModel.isEnabled(target))) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read target failed`,
          data
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    const campaign = await this.campaignRepository.readFull(target.campaignId)

    if (!campaign) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read campaign failed`,
          data
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    const targets = await this.targetRepository.list(target.campaignId)

    if (!targets) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `List targets failed`,
          data
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return [campaign, target, targets.filter(TargetModel.isEnabled)]
  }
}
