import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  ReplServerError,
  UpdateCampaignModel
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

  private readonly knownErrorCodes = ['NOT_FOUND'] as const

  async execute(data: UpdateCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.update(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        const isKnownError = arrayIncludes(this.knownErrorCodes, error.code)

        if (isKnownError) {
          throw new ReplServerError(error.message, {
            code: error.code
          })
        }
      }

      throw error
    }
  }
}
