import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  CreateCampaignData,
  DeleteCampaignData,
  Logger,
  LOGGER,
  ReadCampaignData,
  ReplServerError,
  UpdateCampaignData
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export class CampaignService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignService>(
      CAMPAIGN_SERVICE,
      (c) =>
        new CampaignService(
          c.resolve<Logger>(LOGGER),
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY)
        )
    )
  }

  constructor(
    logger: Logger,
    protected readonly campaignRepository: CampaignRepository
  ) {
    super(logger)

    this.logger.debug(`CampaignService initialized`)
  }

  async createCampaign(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.createCampaign(data)
    } catch (error) {
      this.filterDatabaseException(error, ['CONFLICT'])
    }
  }

  async readCampaign(data: ReadCampaignData): Promise<CampaignModel> {
    const campaignModel = await this.campaignRepository.readCampaign(data)

    if (!campaignModel) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return campaignModel
  }

  async updateCampaign(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.updateCampaign(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async deleteCampaign(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.deleteCampaign(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async listCampaigns(): Promise<CampaignModel[]> {
    return await this.campaignRepository.listCampaigns()
  }
}

export const CAMPAIGN_SERVICE = Symbol('CampaignService')
