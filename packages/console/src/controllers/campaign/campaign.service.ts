import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  ReplServerError
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
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

  async createCampaign(data: CreateCampaignData): Promise<CampaignModel> {
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
      this.filterDatabaseException(error, ['CONFLICT'])
    }
  }

  async readCampaign(data: ReadCampaignData): Promise<CampaignModel> {
    const model = await this.campaignRepository.read(data.campaignId)

    if (!model) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }

  async updateCampaign(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.update(
        data.campaignId,
        data.description,
        data.sessionExpire,
        data.newSessionExpire,
        data.messageExpire
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteCampaign(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.delete(data.campaignId)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listCampaigns(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
