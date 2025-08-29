import { Campaign, CampaignRepository } from '@famir/domain'

export class ReadCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<Campaign | null> {
    return await this.campaignRepository.read()
  }
}
