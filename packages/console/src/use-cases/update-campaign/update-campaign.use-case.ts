import {
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  ReplServerError,
  UpdateCampaignData
} from '@famir/domain'

export class UpdateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: UpdateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.update(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'update-campaign'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
