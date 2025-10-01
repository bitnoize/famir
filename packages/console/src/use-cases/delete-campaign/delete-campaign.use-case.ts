import {
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  DeleteCampaignData,
  ReplServerError
} from '@famir/domain'

export class DeleteCampaignUseCase {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(data: DeleteCampaignData): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.delete(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            context: {
              useCase: 'delete-campaign'
            },
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
