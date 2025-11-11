import { DIContainer } from '@famir/common'
import {
  createCampaignDataSchema,
  deleteCampaignDataSchema,
  readCampaignDataSchema,
  updateCampaignDataSchema
} from '@famir/database'
import {
  CreateCampaignData,
  DeleteCampaignData,
  Logger,
  LOGGER,
  ReadCampaignData,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  UpdateCampaignData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { CAMPAIGN_SERVICE, CampaignService } from '../../services/index.js'
import { BaseController } from '../base/index.js'

export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

export class CampaignController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignController>(
      CAMPAIGN_CONTROLLER,
      (c) =>
        new CampaignController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<CampaignService>(CAMPAIGN_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): CampaignController {
    return container.resolve<CampaignController>(CAMPAIGN_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, router, 'campaign')

    this.validator.addSchemas({
      'console-create-campaign-data': createCampaignDataSchema,
      'console-read-campaign-data': readCampaignDataSchema,
      'console-update-campaign-data': updateCampaignDataSchema,
      'console-delete-campaign-data': deleteCampaignDataSchema
    })

    this.router.addApiCall('createCampaign', this.createCampaignApiCall)
    this.router.addApiCall('readCampaign', this.readCampaignApiCall)
    this.router.addApiCall('updateCampaign', this.updateCampaignApiCall)
    this.router.addApiCall('deleteCampaign', this.deleteCampaignApiCall)
    this.router.addApiCall('listCampaigns', this.listCampaignsApiCall)

    this.logger.debug(`CampaignController initialized`)
  }

  private createCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateCreateCampaignData(data)

      return await this.campaignService.createCampaign(data)
    } catch (error) {
      this.handleException(error, 'createCampaign', data)
    }
  }

  private readCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadCampaignData(data)

      return await this.campaignService.readCampaign(data)
    } catch (error) {
      this.handleException(error, 'readCampaign', data)
    }
  }

  private updateCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateUpdateCampaignData(data)

      return await this.campaignService.updateCampaign(data)
    } catch (error) {
      this.handleException(error, 'updateCampaign', data)
    }
  }

  private deleteCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateDeleteCampaignData(data)

      return await this.campaignService.deleteCampaign(data)
    } catch (error) {
      this.handleException(error, 'deleteCampaign', data)
    }
  }

  private listCampaignsApiCall: ReplServerApiCall = async () => {
    try {
      return await this.campaignService.listCampaigns()
    } catch (error) {
      this.handleException(error, 'listCampaigns', null)
    }
  }

  private validateCreateCampaignData(value: unknown): asserts value is CreateCampaignData {
    try {
      this.validator.assertSchema<CreateCampaignData>('console-create-campaign-data', value)
    } catch (error) {
      throw new ReplServerError(`CreateCampaignData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateReadCampaignData(value: unknown): asserts value is ReadCampaignData {
    try {
      this.validator.assertSchema<ReadCampaignData>('console-read-campaign-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadCampaignData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateUpdateCampaignData(value: unknown): asserts value is UpdateCampaignData {
    try {
      this.validator.assertSchema<UpdateCampaignData>('console-update-campaign-data', value)
    } catch (error) {
      throw new ReplServerError(`UpdateCampaignData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }

  private validateDeleteCampaignData(value: unknown): asserts value is DeleteCampaignData {
    try {
      this.validator.assertSchema<DeleteCampaignData>('console-delete-campaign-data', value)
    } catch (error) {
      throw new ReplServerError(`DeleteCampaignData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
