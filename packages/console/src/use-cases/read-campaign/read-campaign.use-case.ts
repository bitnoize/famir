import { CampaignModel, CampaignRepository, ReadCampaignData } from '@famir/domain'

export class ReadCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: ReadCampaignData): Promise<CampaignModel | null> {
    return await this.campaignRepository.read(data)
  }
}
