import { DIContainer, arrayIncludes } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignModel,
  CampaignRepository,
  CreateCampaignModel,
  DatabaseError,
  ReplServerError
} from '@famir/domain'

export const CREATE_CAMPAIGN_USE_CASE = Symbol('CreateCampaignUseCase')

export class CreateCampaignUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateCampaignUseCase>(
      CREATE_CAMPAIGN_USE_CASE,
      (c) => new CreateCampaignUseCase(c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY))
    )
  }

  constructor(private readonly campaignRepository: CampaignRepository) {}

  private readonly knownErrorCodes = ['CONFLICT'] as const

  async execute(data: CreateCampaignModel): Promise<CampaignModel> {
    try {
      return await this.campaignRepository.create(data)
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
