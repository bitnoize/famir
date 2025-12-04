import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  EnabledFullTargetModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository,
  testEnabledTargetModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import { SetupMirrorData } from './setup-mirror.js'

export const SETUP_MIRROR_SERVICE = Symbol('SetupMirrorService')

export class SetupMirrorService extends BaseService {
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
  ) {
    super()
  }

  async execute(data: SetupMirrorData): Promise<{
    campaign: FullCampaignModel
    target: EnabledFullTargetModel
    targets: EnabledTargetModel[]
  }> {
    const [campaign, target] = await Promise.all([
      this.campaignRepository.readCampaign({
        campaignId: data.campaignId
      }),

      this.targetRepository.readTarget({
        campaignId: data.campaignId,
        targetId: data.targetId
      })
    ])

    if (!campaign) {
      throw new HttpServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    if (!target) {
      throw new HttpServerError(`Target not found`, {
        code: 'NOT_FOUND'
      })
    }

    if (!testEnabledTargetModel(target)) {
      throw new HttpServerError(`Target disabled`, {
        code: 'NOT_FOUND'
      })
    }

    const targets = await this.targetRepository.listTargets({
      campaignId: data.campaignId
    })

    if (!targets) {
      throw new HttpServerError(`Campaign lost`, {
        code: 'NOT_FOUND'
      })
    }

    return {
      campaign,
      target,
      targets: targets.filter(testEnabledTargetModel)
    }
  }
}
