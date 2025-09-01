import { CampaignRepository } from '@famir/domain'

export class DefaultUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<void> {
    const campaign = await this.campaignRepository.read()
  }
}
