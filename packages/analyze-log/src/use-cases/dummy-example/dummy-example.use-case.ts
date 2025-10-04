import { DIContainer } from '@famir/common'
import {
  AnalyzeLogJobData,
  AnalyzeLogJobResult,
  CAMPAIGN_REPOSITORY,
  CampaignRepository
} from '@famir/domain'

export const DUMMY_EXAMPLE_USE_CASE = Symbol('DummyExampleUseCase')

export class DummyExampleUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyExampleUseCase>(
      DUMMY_EXAMPLE_USE_CASE,
      (c) => new DummyExampleUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(protected readonly campaignRepository: CampaignRepository) {}

  async execute(data: AnalyzeLogJobData): Promise<AnalyzeLogJobResult> {
    const campaign = await this.campaignRepository.read({
      campaignId: data.campaignId
    })

    return true
  }
}
