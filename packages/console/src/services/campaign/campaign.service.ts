import { DIContainer, arrayIncludes, randomIdent } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  CampaignShare,
  DatabaseError,
  DatabaseErrorCode,
  FullCampaignModel,
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CAMPAIGN_SERVICE,
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData,
} from './campaign.js'

/**
 * Campaign service
 * @category Services
 */
export class CampaignService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) => new CampaignService(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(protected readonly campaignRepository: CampaignRepository) {}

  /**
   * Create campaign
   */
  async create(data: CreateCampaignData): Promise<true> {
    try {
      await this.campaignRepository.create(
        data.campaignId,
        data.mirrorDomain,
        data.description,
        data.cryptSecret ?? randomIdent(),
        data.upgradeSessionPath,
        data.sessionCookieName,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire
      )

      return true
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
  }

  /**
   * Read campaign
   */
  async read(data: ReadCampaignData): Promise<FullCampaignModel> {
    const campaign = await this.campaignRepository.readFull(data.campaignId)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND',
      })
    }

    return campaign
  }

  /**
   * Read campaign share
   */
  async readShare(): Promise<CampaignShare> {
    return await this.campaignRepository.readShare()
  }

  /**
   * Lock campaign
   */
  async lock(data: LockCampaignData): Promise<string> {
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
   * Unlock campaign
   */
  async unlock(data: UnlockCampaignData): Promise<true> {
    try {
      await this.campaignRepository.unlock(data.campaignId, data.lockSecret)

      return true
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
   * Update campaign
   */
  async update(data: UpdateCampaignData): Promise<true> {
    try {
      await this.campaignRepository.update(
        data.campaignId,
        data.description,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire,
        data.lockSecret
      )

      return true
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
   * Delete campaign
   */
  async delete(data: DeleteCampaignData): Promise<true> {
    try {
      await this.campaignRepository.delete(data.campaignId, data.lockSecret)

      return true
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
   * List campaigns
   */
  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
