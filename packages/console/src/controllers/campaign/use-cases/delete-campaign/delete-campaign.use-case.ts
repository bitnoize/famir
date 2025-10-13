import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  DatabaseError,
  DeleteCampaignModel,
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

  private readonly knownErrorCodes = ['NOT_FOUND', 'FORBIDDEN'] as const

  async execute(data: DeleteCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.delete(data)
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
