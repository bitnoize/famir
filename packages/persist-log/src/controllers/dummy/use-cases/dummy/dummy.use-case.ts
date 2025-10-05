import { DIContainer } from '@famir/common'
import {
  AnalyzeLogJobData,
  AnalyzeLogJobResult,
  CAMPAIGN_REPOSITORY,
  CampaignRepository
} from '@famir/domain'

export const DUMMY_USE_CASE = Symbol('DummyUseCase')

export class DummyUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyUseCase>(
      DUMMY_USE_CASE,
      (c) => new DummyUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
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
