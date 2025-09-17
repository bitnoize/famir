import { CampaignModel, CampaignRepository } from '@famir/domain'
import { CreateCampaignDto } from './create-campaign.js'

export class CreateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(dto: CreateCampaignDto): Promise<CampaignModel> {
    const [isOk, campaign, code, reason] = await this.campaignRepository.create(
      dto.id,
      dto.description ?? 'Default campaign',
      dto.landingSecret ?? 'secret',
      dto.landingAuthPath ?? '/fake-auth',
      dto.landingAuthParam ?? 'data',
      dto.landingLureParam ?? 'data',
      dto.sessionCookieName ?? 'fake-sess',
      dto.sessionExpire ?? 300 * 1000,
      dto.newSessionExpire ?? 300 * 1000,
      dto.messageExpire ?? 3600 * 1000
    )

    if (isOk) {
      return campaign
    }

    throw new ShellError(
      {
        status: [code, reason]
      },
      `Create campaign failed`
    )
  }
}
