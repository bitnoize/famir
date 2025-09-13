import { CampaignRepository } from '@famir/domain'
import { HeartbeatResult } from '@famir/task-queue'

export class ScanSessionsUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<HeartbeatResult> {
    const campaign = await this.campaignRepository.read()

    return 1
  }
}
