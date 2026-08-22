import { DIContainer, encrypt, randomName } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  DatabaseError,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  REDIRECTOR_REPOSITORY,
  RedirectorParams,
  RedirectorRepository,
  TARGET_REPOSITORY,
  TargetRepository,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the lure service.
 *
 * @category Lure
 */
export const LURE_SERVICE = Symbol('LureService')

/**
 * Represents the lure service.
 *
 * @category Lure
 */
export class LureService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureService>(
      LURE_SERVICE,
      (c) =>
        new LureService(
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<TargetRepository>(TARGET_REPOSITORY),
          c.resolve<RedirectorRepository>(REDIRECTOR_REPOSITORY),
          c.resolve<LureRepository>(LURE_REPOSITORY)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   * @param targetRepository - The target repository instance.
   * @param redirectorRepository - The redirector repository instance.
   * @param lureRepository - The lure repository instance.
   */
  constructor(
    protected readonly campaignRepository: CampaignRepository,
    protected readonly targetRepository: TargetRepository,
    protected readonly redirectorRepository: RedirectorRepository,
    protected readonly lureRepository: LureRepository
  ) {}

  /**
   * Creates a new lure.
   */
  async create(data: {
    campaignId: string
    lureId: string
    path: string
    redirectorId: string
  }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.lureRepository.create(
        data.campaignId,
        data.lureId,
        data.path,
        data.redirectorId,
        lockSecret
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        if (error.code === 'CONFLICT') {
          throw ReplServerError.conflict(error.message)
        }

        throw ReplServerError.internal(`Create lure failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Reads the lure by its ID.
   */
  async read(data: { campaignId: string; lureId: string }): Promise<LureModel> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw ReplServerError.notFound(`Lure not found`)
    }

    return lure
  }

  /**
   * Enables the lure, making it available for request routing.
   */
  async enable(data: { campaignId: string; lureId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.lureRepository.enable(data.campaignId, data.lureId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internal(`Enable lure failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Disables the lure, stopping request routing.
   */
  async disable(data: { campaignId: string; lureId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.lureRepository.disable(data.campaignId, data.lureId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internal(`Disable lure failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Deletes the lure by its ID.
   */
  async delete(data: { campaignId: string; lureId: string; redirectorId: string }): Promise<void> {
    const lockSecret = await this.lockCampaign(data.campaignId)

    try {
      await this.lureRepository.delete(data.campaignId, data.lureId, data.redirectorId, lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        if (error.code === 'FORBIDDEN') {
          throw ReplServerError.forbidden(error.message)
        }

        throw ReplServerError.internal(`Delete lure failed`, null, error)
      }

      throw error
    } finally {
      await this.campaignRepository.unlock(data.campaignId, lockSecret)
    }
  }

  /**
   * Lists all lures for the campaign.
   */
  async list(data: { campaignId: string }): Promise<LureModel[]> {
    const lures = await this.lureRepository.list(data.campaignId)

    if (!lures) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return lures
  }

  /**
   * Makes the lure URL with optional params.
   */
  async makeUrl(data: {
    campaignId: string
    lureId: string
    targetId: string
    params: RedirectorParams
  }): Promise<string> {
    const lure = await this.lureRepository.read(data.campaignId, data.lureId)

    if (!lure) {
      throw ReplServerError.notFound(`Lure not found`)
    }

    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    const target = await this.targetRepository.readFull(data.campaignId, data.targetId)

    if (!target) {
      throw ReplServerError.notFound(`Target not found`)
    }

    const redirector = await this.redirectorRepository.readFull(data.campaignId, lure.redirectorId)

    if (!redirector) {
      throw ReplServerError.notFound(`Redirector not found`)
    }

    if (!redirector.checkParams(data.params)) {
      throw ReplServerError.badRequest(`Redirector wrong params`)
    }

    if (redirector.isLoose) {
      return [target.mirrorUrl, lure.path].join('')
    } else {
      return [
        target.mirrorUrl,
        lure.path,
        '?',
        randomName(),
        '=',
        encrypt(JSON.stringify(data.params), campaign.cryptSecret),
      ].join('')
    }
  }

  protected async lockCampaign(campaignId: string): Promise<string> {
    try {
      return await this.campaignRepository.lock(campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw ReplServerError.notFound(error.message)
        }

        if (error.code === 'FORBIDDEN') {
          throw ReplServerError.forbidden(error.message)
        }

        throw ReplServerError.internal(`Lock campaign failed`, null, error)
      }

      throw error
    }
  }
}
