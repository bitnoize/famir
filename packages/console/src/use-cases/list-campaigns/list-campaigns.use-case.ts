import { CampaignModel, CampaignRepository } from '@famir/domain'

export class ListCampaignsUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
