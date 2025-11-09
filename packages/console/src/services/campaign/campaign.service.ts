import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  CreateCampaignModel,
  DeleteCampaignModel,
  Logger,
  LOGGER,
  ReadCampaignModel,
  ReplServerError,
  UpdateCampaignModel
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const CAMPAIGN_SERVICE = Symbol('CampaignService')

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

  async create(data: CreateCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.create(data)
    } catch (error) {
      this.filterDatabaseException(error, ['CONFLICT'])
    }
  }

  async read(data: ReadCampaignModel): Promise<CampaignModel> {
    const campaign = await this.campaignRepository.read(data)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return campaign
  }

  async update(data: UpdateCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.update(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])
    }
  }

  async delete(data: DeleteCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.delete(data)
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND', 'FORBIDDEN'])
    }
  }

  async list(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
