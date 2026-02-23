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
import { FindTargetData } from './setup-mirror.js'

export const SETUP_MIRROR_SERVICE = Symbol('SetupMirrorService')

export class SetupMirrorService {
  static inject(container: DIContainer) {
    container.registerSingleton<SetupMirrorService>(
      SETUP_MIRROR_SERVICE,
      (c) =>
        new SetupMirrorService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async findTarget(
    data: FindTargetData
  ): Promise<[FullCampaignModel, EnabledFullTargetModel, EnabledTargetModel[]]> {
    const target = await this.targetRepository.find(data.mirrorHost)

    if (!(target && TargetModel.isEnabled(target))) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Target not found`,
          mirrorHost: data.mirrorHost
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    const campaign = await this.campaignRepository.read(target.campaignId)

    if (!campaign) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Target found but campaign not`,
          campaignId: target.campaignId,
          targetId: target.targetId
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    const targets = await this.targetRepository.list(target.campaignId)

    if (!targets) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Target found but list fail`,
          campaignId: target.campaignId,
          targetId: target.targetId
        },
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    return [campaign, target, targets.filter(TargetModel.isEnabled)]
  }
}
