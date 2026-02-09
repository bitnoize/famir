import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  FullCampaignModel,
  ReplServerError
} from '@famir/domain'
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

  async create(data: CreateCampaignData): Promise<number> {
    try {
      return await this.campaignRepository.create(
        data.campaignId,
        data.mirrorDomain,
        data.description,
        data.landingUpgradePath,
        data.landingUpgradeParam,
        data.landingRedirectorParam,
        data.sessionCookieName,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire
      )
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

  async lock(data: LockCampaignData): Promise<number> {
    try {
      return await this.campaignRepository.lock(data.campaignId, data.isForce ?? false)
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async unlock(data: UnlockCampaignData): Promise<void> {
    try {
      await this.campaignRepository.unlock(data.campaignId, data.lockCode)
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async update(data: UpdateCampaignData): Promise<void> {
    try {
      await this.campaignRepository.update(
        data.campaignId,
        data.description,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire,
        data.lockCode
      )
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async delete(data: DeleteCampaignData): Promise<void> {
    try {
      await this.campaignRepository.delete(data.campaignId, data.lockCode)
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])

      throw error
    }
  }

  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
