import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignLimiter,
  CampaignModel,
  CampaignRepository,
  EnabledTargetModel,
  HttpServerError,
  TARGET_REPOSITORY,
  TargetLink,
  TargetModel,
  TargetRepository,
} from '@famir/domain'

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
        new this(
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

  async checkCampaignLimiter(data: {
    campaignId: string
    identity: string
    cost: number
  }): Promise<CampaignLimiter> {
    const limiter = await this.campaignRepository.checkLimiter(
      data.campaignId,
      data.identity,
      data.cost
    )

    if (!limiter) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`, {
        reason: `Check campaign limiter failed`,
      })
    }

    return limiter
  }

  async findTargetLink(data: { mirrorHost: string }): Promise<TargetLink> {
    const targetLink = await this.targetRepository.find(data.mirrorHost)

    if (!targetLink) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`, {
        reason: `Target link not found`,
        data,
      })
    }

    return targetLink
  }

  async readCampaign(data: { campaignId: string }): Promise<CampaignModel> {
    const campaign = await this.campaignRepository.read(data.campaignId)

    if (!campaign) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`)
    }

    return campaign
  }

  async readTarget(data: { campaignId: string; targetId: string }): Promise<EnabledTargetModel> {
    const target = await this.targetRepository.read(data.campaignId, data.targetId)

    if (!(target && TargetModel.isEnabled(target))) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`, {
        reason: `Target not found`,
        data,
      })
    }

    return target
  }

  async listTargets(data: { campaignId: string }): Promise<TargetModel[]> {
    const targets = await this.targetRepository.list(data.campaignId)

    if (!targets) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`)
    }

    return targets
  }
}
