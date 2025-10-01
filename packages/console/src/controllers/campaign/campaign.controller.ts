import { CampaignModel, Logger, ReplServerContext, Validator } from '@famir/domain'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ListCampaignsUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/index.js'
import {
  validateCreateCampaignData,
  validateDeleteCampaignData,
  validateReadCampaignData,
  validateUpdateCampaignData
} from './campaign.utils.js'

export class CampaignController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly createCampaignUseCase: CreateCampaignUseCase,
    protected readonly readCampaignUseCase: ReadCampaignUseCase,
    protected readonly updateCampaignUseCase: UpdateCampaignUseCase,
    protected readonly deleteCampaignUseCase: DeleteCampaignUseCase,
    protected readonly listCampaignsUseCase: ListCampaignsUseCase
  ) {
    super(validator, logger, 'campaign')

    context.setHandler('createCampaign', this.createHandler)
    context.setHandler('readCampaign', this.readHandler)
    context.setHandler('updateCampaign', this.updateHandler)
    context.setHandler('deleteCampaign', this.deleteHandler)
    context.setHandler('listCampaigns', this.listHandler)
  }

  private readonly createHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateCreateCampaignData(this.assertSchema, data)

      return await this.createCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  private readonly readHandler = async (data: unknown): Promise<CampaignModel | null> => {
    try {
      validateReadCampaignData(this.assertSchema, data)

      return await this.readCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  private readonly updateHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateUpdateCampaignData(this.assertSchema, data)

      return await this.updateCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'update', data)
    }
  }

  private readonly deleteHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateDeleteCampaignData(this.assertSchema, data)

      return await this.deleteCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'delete', data)
    }
  }

  private readonly listHandler = async (): Promise<CampaignModel[]> => {
    try {
      return await this.listCampaignsUseCase.execute()
    } catch (error) {
      this.exceptionFilter(error, 'list', undefined)
    }
  }
}
