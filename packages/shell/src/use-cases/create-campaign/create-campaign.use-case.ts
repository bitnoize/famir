import { CampaignModel, CampaignRepository, DatabaseError, ReplServerError } from '@famir/domain'
import { CreateCampaignData } from './create-campaign.js'

export class CreateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.create(
        data.id,
        data.description ?? 'Default campaign',
        data.landingSecret ?? 'secret',
        data.landingAuthPath ?? '/fake-auth',
        data.landingAuthParam ?? 'data',
        data.landingLureParam ?? 'data',
        data.sessionCookieName ?? 'fake-sess',
        data.sessionExpire ?? 24 * 3600 * 1000,
        data.newSessionExpire ?? 300 * 1000,
        data.messageExpire ?? 3600 * 1000
      )
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['CONFLICT'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'create-campaign'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
