import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  DeleteCampaignData,
  ReplServerError
} from '@famir/domain'

export const DELETE_CAMPAIGN_USE_CASE = Symbol('DeleteCampaignUseCase')

export class DeleteCampaignUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<DeleteCampaignUseCase>(
      DELETE_CAMPAIGN_USE_CASE,
      (c) => new DeleteCampaignUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

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
