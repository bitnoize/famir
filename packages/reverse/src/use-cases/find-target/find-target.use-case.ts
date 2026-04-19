import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  CampaignShare,
  EnabledFullTargetModel,
  FullCampaignModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { FIND_TARGET_USE_CASE, FindTargetData } from './find-target.js'

/*
 * Find target use-case
 */
export class FindTargetUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<FindTargetUseCase>(
      FIND_TARGET_USE_CASE,
      (c) =>
        new FindTargetUseCase(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  /*
   * Execute use-case
   */
  async execute(
    data: FindTargetData
  ): Promise<[CampaignShare, FullCampaignModel, EnabledFullTargetModel, TargetModel[]]> {
    const target = await this.targetRepository.findFull(data.mirrorHost)

    if (!(target && TargetModel.isEnabled(target))) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read target failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    const campaign = await this.campaignRepository.readFull(target.campaignId)

    if (!campaign) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read campaign failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    const campaignShare = await this.campaignRepository.readShare()

    const targets = await this.targetRepository.list(target.campaignId)

    if (!targets) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `List targets failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return [campaignShare, campaign, target, targets]
  }
}
