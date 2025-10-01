import { CampaignRepository, AnalyzeLogJobData, AnalyzeLogJobResult } from '@famir/domain'

export class DummyExampleUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(data: AnalyzeLogJobData): Promise<AnalyzeLogJobResult> {
    const campaign = await this.campaignRepository.read(data.campaignId)

    return true
  }
}
