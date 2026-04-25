import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  EnabledFullTargetModel,
  FullCampaignModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
} from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import {
  FindTargetData,
  ListTargetsData,
  ReadCampaignData,
  SETUP_MIRROR_SERVICE,
} from './setup-mirror.js'

/**
 * Represents a setup-mirror service
 *
 * @category SetupMirror
 */
export class SetupMirrorService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<SetupMirrorService>(
      SETUP_MIRROR_SERVICE,
      (c) => new SetupMirrorService(c.resolve(CAMPAIGN_REPOSITORY), c.resolve(TARGET_REPOSITORY))
    )
  }

  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async readCampaign(data: ReadCampaignData): Promise<FullCampaignModel> {
    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `Read campaign failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return campaign
  }

  async findTarget(data: FindTargetData): Promise<EnabledFullTargetModel> {
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

    return target
  }

  async listTargets(data: ListTargetsData): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data.campaignId)

    if (!targets) {
      throw new HttpServerError(`Service unavailable`, {
        context: {
          reason: `List targets failed`,
          data,
        },
        code: 'SERVICE_UNAVAILABLE',
      })
    }

    return targets
  }
}
