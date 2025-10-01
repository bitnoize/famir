import { AnalyzeLogJobData, AnalyzeLogJobResult, CampaignRepository } from '@famir/domain'

export class DummyExampleUseCase {
  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(data: AnalyzeLogJobData): Promise<AnalyzeLogJobResult> {
    const campaign = await this.campaignRepository.read({
      id: data.campaignId
    })

    return true
  }
}
