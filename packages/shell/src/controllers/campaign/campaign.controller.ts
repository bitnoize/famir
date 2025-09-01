import { Campaign } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from '../../use-cases/index.js'
import { validateCreateCampaignDto, validateUpdateCampaignDto } from './campaign.utils.js'

export class CampaignController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    context: Context,
    protected readonly createCampaignUseCase: CreateCampaignUseCase,
    protected readonly readCampaignUseCase: ReadCampaignUseCase,
    protected readonly updateCampaignUseCase: UpdateCampaignUseCase,
    protected readonly deleteCampaignUseCase: DeleteCampaignUseCase
  ) {
    this.assertSchema = validator.assertSchema

    context.setHandler('createCampaign', `Create campaign`, this.createHandler)
    context.setHandler('readCampaign', `Read campaign`, this.readHandler)
    context.setHandler('updateCampaign', `Update properties`, this.updateHandler)
    context.setHandler('deleteCampaign', `Delete campaign`, this.deleteHandler)
  }

  private readonly createHandler = async (dto: unknown): Promise<true> => {
    validateCreateCampaignDto(this.assertSchema, dto)

    return await this.createCampaignUseCase.execute(dto)
  }

  private readonly readHandler = async (): Promise<Campaign | null> => {
    return await this.readCampaignUseCase.execute()
  }

  private readonly updateHandler = async (dto: unknown): Promise<true> => {
    validateUpdateCampaignDto(this.assertSchema, dto)

    return await this.updateCampaignUseCase.execute(dto)
  }

  private readonly deleteHandler = async (): Promise<true> => {
    return await this.deleteCampaignUseCase.execute()
  }
}
