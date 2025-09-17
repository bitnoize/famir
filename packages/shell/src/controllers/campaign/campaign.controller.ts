import {
  CampaignModel,
  Logger,
  ReplServerContext,
  Validator,
  ValidatorAssertSchema
} from '@famir/domain'
import { CreateCampaignDto, CreateCampaignUseCase } from '../../use-cases/index.js'

export class CampaignController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    context: ReplServerContext,
    protected readonly createCampaignUseCase: CreateCampaignUseCase
  ) {
    this.assertSchema = validator.assertSchema

    context.setHandler('createCampaign', `Create campaign`, this.createHandler)
  }

  private readonly createHandler = async (dto: unknown): Promise<CampaignModel> => {
    this.assertSchema<CreateCampaignDto>('create-campaign-dto', dto)

    return await this.createCampaignUseCase.execute(dto)
  }
}
