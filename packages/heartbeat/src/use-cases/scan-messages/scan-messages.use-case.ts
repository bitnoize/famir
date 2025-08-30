import { CampaignRepository } from '@famir/domain'

export class ScanMessagesUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<void> {
    const campaign = await this.campaignRepository.read()
  }
}
