import { DIContainer } from '@famir/common'
import {
  CampaignModel,
  Logger,
  LOGGER,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateCampaignData,
  validateDeleteCampaignData,
  validateReadCampaignData,
  validateUpdateCampaignData
} from './campaign.utils.js'
import {
  CREATE_CAMPAIGN_USE_CASE,
  CreateCampaignUseCase,
  DELETE_CAMPAIGN_USE_CASE,
  DeleteCampaignUseCase,
  LIST_CAMPAIGNS_USE_CASE,
  ListCampaignsUseCase,
  READ_CAMPAIGN_USE_CASE,
  ReadCampaignUseCase,
  UPDATE_CAMPAIGN_USE_CASE,
  UpdateCampaignUseCase
} from './use-cases/index.js'

export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

export class CampaignController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignController>(
      CAMPAIGN_CONTROLLER,
      (c) =>
        new CampaignController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<CreateCampaignUseCase>(CREATE_CAMPAIGN_USE_CASE),
          c.resolve<ReadCampaignUseCase>(READ_CAMPAIGN_USE_CASE),
          c.resolve<UpdateCampaignUseCase>(UPDATE_CAMPAIGN_USE_CASE),
          c.resolve<DeleteCampaignUseCase>(DELETE_CAMPAIGN_USE_CASE),
          c.resolve<ListCampaignsUseCase>(LIST_CAMPAIGNS_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): CampaignController {
    return container.resolve<CampaignController>(CAMPAIGN_CONTROLLER)
  }

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

    validator.addSchemas(addSchemas)

    context.setHandler('createCampaign', this.createCampaignHandler)
    context.setHandler('readCampaign', this.readCampaignHandler)
    context.setHandler('updateCampaign', this.updateCampaignHandler)
    context.setHandler('deleteCampaign', this.deleteCampaignHandler)
    context.setHandler('listCampaigns', this.listCampaignsHandler)
  }

  private readonly createCampaignHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateCreateCampaignData(this.assertSchema, data)

      return await this.createCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'createCampaign', data)
    }
  }

  private readonly readCampaignHandler = async (data: unknown): Promise<CampaignModel | null> => {
    try {
      validateReadCampaignData(this.assertSchema, data)

      return await this.readCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'readCampaign', data)
    }
  }

  private readonly updateCampaignHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateUpdateCampaignData(this.assertSchema, data)

      return await this.updateCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'updateCampaign', data)
    }
  }

  private readonly deleteCampaignHandler = async (data: unknown): Promise<CampaignModel> => {
    try {
      validateDeleteCampaignData(this.assertSchema, data)

      return await this.deleteCampaignUseCase.execute(data)
    } catch (error) {
      this.exceptionFilter(error, 'deleteCampaign', data)
    }
  }

  private readonly listCampaignsHandler = async (): Promise<CampaignModel[]> => {
    try {
      return await this.listCampaignsUseCase.execute()
    } catch (error) {
      this.exceptionFilter(error, 'listCampaigns', undefined)
    }
  }
}
