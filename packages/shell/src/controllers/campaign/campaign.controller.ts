import { Campaign } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context, ReplServerError } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from '../../use-cases/index.js'
import { BaseController } from '../base/base.controller.js'
import { validateCreateCampaignDto, validateUpdateCampaignDto } from './campaign.utils.js'

export class CampaignController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    context: Context,
    protected readonly createCampaignUseCase: CreateCampaignUseCase,
    protected readonly readCampaignUseCase: ReadCampaignUseCase,
    protected readonly updateCampaignUseCase: UpdateCampaignUseCase,
    protected readonly deleteCampaignUseCase: DeleteCampaignUseCase
  ) {
    super(validator, logger, context, 'campaign')

    this.context.addValue(this.controllerName, {
      create: this.createHandler,
      read: this.readHandler,
      update: this.updateHandler,
      delete: this.deleteHandler
    })
  }

  private readonly createHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateCreateCampaignDto(this.assertSchema, dto)

      return await this.createCampaignUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'read', undefined)
    }
  }

  private readonly readHandler = async (): Promise<Campaign | null | ReplServerError> => {
    try {
      return await this.readCampaignUseCase.execute()
    } catch (error) {
      return this.exceptionFilter(error, 'read', undefined)
    }
  }

  private readonly updateHandler = async (dto: unknown): Promise<true | ReplServerError> => {
    try {
      validateUpdateCampaignDto(this.assertSchema, dto)

      return await this.updateCampaignUseCase.execute(dto)
    } catch (error) {
      return this.exceptionFilter(error, 'update', dto)
    }
  }

  private readonly deleteHandler = async (): Promise<true | ReplServerError> => {
    try {
      return await this.deleteCampaignUseCase.execute()
    } catch (error) {
      return this.exceptionFilter(error, 'delete', undefined)
    }
  }
}
