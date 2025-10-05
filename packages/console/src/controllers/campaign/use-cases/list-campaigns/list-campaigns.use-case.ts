import { DIContainer } from '@famir/common'
import { CAMPAIGN_REPOSITORY, CampaignModel, CampaignRepository } from '@famir/domain'

export const LIST_CAMPAIGNS_USE_CASE = Symbol('ListCampaignsUseCase')

export class ListCampaignsUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ListCampaignsUseCase>(
      LIST_CAMPAIGNS_USE_CASE,
      (c) => new ListCampaignsUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(): Promise<CampaignModel[]> {
    return await this.campaignRepository.list()
  }
}
