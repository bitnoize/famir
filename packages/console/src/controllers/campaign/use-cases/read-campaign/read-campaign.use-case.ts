import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  ReadCampaignModel,
  ReplServerError
} from '@famir/domain'

export const READ_CAMPAIGN_USE_CASE = Symbol('ReadCampaignUseCase')

export class ReadCampaignUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadCampaignUseCase>(
      READ_CAMPAIGN_USE_CASE,
      (c) => new ReadCampaignUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: ReadCampaignModel): Promise<CampaignModel> {
    const campaign = await this.campaignRepository.read(data)

    if (!campaign) {
      throw new ReplServerError(`Campaign not found`, {
        code: 'NOT_FOUND'
      })
    }

    return campaign
  }
}
