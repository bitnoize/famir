import { CampaignModel, CampaignRepository } from '@famir/domain'
import { ReadCampaignData } from './read-campaign.js'

export class ReadCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: ReadCampaignData): Promise<CampaignModel | null> {
    return await this.campaignRepository.read(data.id)
  }
}
