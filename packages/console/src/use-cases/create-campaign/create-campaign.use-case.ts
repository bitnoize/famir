import {
  CampaignModel,
  CampaignRepository,
  CreateCampaignData,
  DatabaseError,
  ReplServerError
} from '@famir/domain'

export class CreateCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: CreateCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.create(data)
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
