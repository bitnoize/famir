import { CampaignRepository } from '@famir/domain'
import { UpdateCampaignDto } from './update-campaign.js'

export class UpdateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(dto: UpdateCampaignDto): Promise<true> {
    await this.campaignRepository.update(
      dto.description,
      dto.sessionExpire,
      dto.newSessionExpire,
      dto.sessionLimit,
      dto.sessionEmergeIdleTime,
      dto.sessionEmergeLimit,
      dto.messageExpire,
      dto.messageLimit,
      dto.messageEmergeIdleTime,
      dto.messageEmergeLimit,
      dto.messageLockExpire
    )

    return true
  }
}
