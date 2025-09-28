import { CampaignRepository, TargetRepository } from '@famir/domain'
import { GatewayData, GatewayResult } from './gateway.js'

export class GatewayUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly targetRepository: TargetRepository
  ) {}

  async execute(data: GatewayData): Promise<GatewayResult | null> {
    const campaign = await this.campaignRepository.read(data.campaignId)
    const target = await this.targetRepository.readEnabled(data.campaignId, data.targetId)

    if (campaign === null || target === null) {
      return null
    }

    return { campaign, target }
  }
}
