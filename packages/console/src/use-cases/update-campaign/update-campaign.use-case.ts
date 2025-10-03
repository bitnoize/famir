import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  ReplServerError,
  UpdateCampaignData
} from '@famir/domain'

export const UPDATE_CAMPAIGN_USE_CASE = Symbol('UpdateCampaignUseCase')

export class UpdateCampaignUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<UpdateCampaignUseCase>(
      UPDATE_CAMPAIGN_USE_CASE,
      (c) => new UpdateCampaignUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

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
