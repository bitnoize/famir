import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  DatabaseErrorCode,
  FullCampaignModel
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import {
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData
} from './campaign.js'

export const CAMPAIGN_SERVICE = Symbol('CampaignService')

export class CampaignService {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) => new CampaignService(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async create(data: CreateCampaignData): Promise<true> {
    try {
      await this.campaignRepository.create(
        data.campaignId,
        data.mirrorDomain,
        data.description,
        data.lockTimeout,
        data.landingUpgradePath,
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
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async read(data: ReadCampaignData): Promise<FullCampaignModel> {
    const model = await this.campaignRepository.read(data.campaignId)

    if (!model) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async lock(data: LockCampaignData): Promise<string> {
    try {
      return await this.campaignRepository.lock(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async unlock(data: UnlockCampaignData): Promise<true> {
    try {
      await this.campaignRepository.unlock(data.campaignId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

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
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async delete(data: DeleteCampaignData): Promise<true> {
    try {
      await this.campaignRepository.delete(data.campaignId, data.lockSecret)

      return true
    } catch (error) {
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND', 'FORBIDDEN']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }

  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
