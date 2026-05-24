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

/**
 * DI token for the setup-mirror service.
 *
 * @category SetupMirror
 */
export const SETUP_MIRROR_SERVICE = Symbol('SetupMirrorService')

/**
 * Represents the setup-mirror service.
 *
 * @category SetupMirror
 */
export class SetupMirrorService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SetupMirrorService>(
      SETUP_MIRROR_SERVICE,
      (c) =>
        new SetupMirrorService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   * @param targetRepository - The target repository instance.
   */
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository
  ) {}

  async readCampaign(data: { campaignId: string }): Promise<FullCampaignModel> {
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

  async findTarget(data: { mirrorHost: string }): Promise<EnabledFullTargetModel> {
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

  async listTargets(data: { campaignId: string }): Promise<TargetModel[]> {
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
