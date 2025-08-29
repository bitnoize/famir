import { CampaignRepository, TargetRepository } from '@famir/domain'
import { GatewayDto, GatewayResult } from './gateway.js'

export class GatewayUseCase {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly targetRepository: TargetRepository
  ) {}

  async execute(dto: GatewayDto): Promise<GatewayResult | null> {
    const campaign = await this.campaignRepository.read()
    const target = await this.targetRepository.readEnabled(dto.targetId)

    if (campaign === null || target === null) {
      return null
    }

    return { campaign, target }
  }
}
