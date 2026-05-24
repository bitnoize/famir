import { DIContainer, arrayIncludes, randomIdent, randomName } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  DatabaseErrorCode,
  FullCampaignModel,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the campaign service.
 *
 * @category Campaign
 */
export const CAMPAIGN_SERVICE = Symbol('CampaignService')

/**
 * Represents the campaign service.
 *
 * @category Campaign
 */
export class CampaignService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) => new CampaignService(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param campaignRepository - The campaign repository instance.
   */
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  /**
   * Creates a new campaign.
   *
   * @param data - The data object.
   * @returns The created campaign model.
   */
  async create(data: {
    campaignId: string
    mirrorDomain: string
    description: string
    cryptSecret: string | null | undefined
    upgradeSessionPath: string
    sessionCookieName: string | null | undefined
    sessionExpire: number
    newSessionExpire: number
    messageExpire: number
  }): Promise<FullCampaignModel> {
    try {
      await this.campaignRepository.create(
        data.campaignId,
        data.mirrorDomain,
        data.description,
        data.cryptSecret ?? randomIdent(),
        data.upgradeSessionPath,
        data.sessionCookieName ?? randomName(),
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['CONFLICT']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }

    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return campaign
  }

  /**
   * Reads the campaign by its ID.
   *
   * @param data - The data object.
   * @returns The campaign model.
   * @throws {@link ReplServerError} If the campaign is not found.
   */
  async read(data: { campaignId: string }): Promise<FullCampaignModel> {
    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return campaign
  }

  /**
   * Acquires a distributed lock for the campaign.
   *
   * @param data - The data object.
   * @returns The campaign lock secret.
   */
  async lock(data: { campaignId: string }): Promise<string> {
    try {
      return await this.campaignRepository.lock(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  /**
   * Releases a previously acquired lock on the campaign.
   *
   * @param data - The data object.
   */
  async unlock(data: { campaignId: string; lockSecret: string }): Promise<void> {
    try {
      await this.campaignRepository.unlock(data.campaignId, data.lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  /**
   * Updates the campaign specific fields.
   *
   * @param data - The data object.
   */
  async update(data: {
    campaignId: string
    description: string | null | undefined
    sessionExpire: number | null | undefined
    newSessionExpire: number | null | undefined
    messageExpire: number | null | undefined
    lockSecret: string
  }): Promise<void> {
    try {
      await this.campaignRepository.update(
        data.campaignId,
        data.description,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire,
        data.lockSecret
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  /**
   * Deletes the campaign by its ID.
   *
   * @param data - The data object.
   */
  async delete(data: { campaignId: string; lockSecret: string }): Promise<void> {
    try {
      await this.campaignRepository.delete(data.campaignId, data.lockSecret)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code,
          })
        }
      }

      throw error
    }
  }

  /**
   * Lists all campaigns.
   *
   * @returns The array of campaign models.
   */
  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
