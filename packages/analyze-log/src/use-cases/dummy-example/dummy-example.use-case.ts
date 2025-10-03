import { DIContainer } from '@famir/common'
import { AnalyzeLogJobData, AnalyzeLogJobResult, CampaignRepository } from '@famir/domain'

export class DummyExampleUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyExampleUseCase>(
      'DummyExampleUseCase',
      (c) => new DummyExampleUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
    )
  }

  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(data: AnalyzeLogJobData): Promise<AnalyzeLogJobResult> {
    const campaign = await this.campaignRepository.read({
      id: data.campaignId
    })

    return true
  }
}
