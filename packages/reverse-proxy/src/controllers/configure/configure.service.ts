import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetRepository,
  testEnabledTargetModel
} from '@famir/domain'
import { ConfigureData, ConfigureReply } from './configure.js'

export const CONFIGURE_SERVICE = Symbol('ConfigureService')

export class ConfigureService {
  static inject(container: DIContainer) {
    container.registerSingleton<ConfigureService>(
      CONFIGURE_SERVICE,
      (c) =>
        new ConfigureService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async execute(data: ConfigureData): Promise<ConfigureReply> {
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
