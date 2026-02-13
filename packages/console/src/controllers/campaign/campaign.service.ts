import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  FullCampaignModel
} from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { BaseService } from '../base/index.js'
import {
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData
} from './campaign.js'

export const CAMPAIGN_SERVICE = Symbol('CampaignService')

export class CampaignService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) => new CampaignService(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(protected readonly campaignRepository: CampaignRepository) {
    super()
  }

  async create(data: CreateCampaignData): Promise<true> {
    try {
      await this.campaignRepository.create(
        data.campaignId,
        data.mirrorDomain,
        data.description,
        data.lockTimeout,
        data.landingUpgradePath,
        data.landingUpgradeParam,
        data.landingRedirectorParam,
        data.sessionCookieName,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire
      )

      return true
    } catch (error) {
      this.simpleDatabaseException(error, ['CONFLICT'])

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
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async unlock(data: UnlockCampaignData): Promise<true> {
    try {
      await this.campaignRepository.unlock(data.campaignId, data.lockSecret)

      return true
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

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
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async delete(data: DeleteCampaignData): Promise<true> {
    try {
      await this.campaignRepository.delete(data.campaignId, data.lockSecret)

      return true
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
