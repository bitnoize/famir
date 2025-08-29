import { CampaignRepository } from '@famir/domain'

export class DeleteCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<true> {
    await this.campaignRepository.delete()

    return true
  }
}
