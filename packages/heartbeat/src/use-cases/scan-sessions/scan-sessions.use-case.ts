import { Campaign, CampaignRepository } from '@famir/domain'

export class ScanSessionsUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<void> {
    const campaign = await this.campaignRepository.read()
  }
}
