import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  UpdateCampaignData
} from './campaign.js'
import {
  createCampaignDataSchema,
  deleteCampaignDataSchema,
  readCampaignDataSchema,
  updateCampaignDataSchema
} from './campaign.schemas.js'
import { CAMPAIGN_SERVICE, type CampaignService } from './campaign.service.js'

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
    super(validator, logger, router)

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
    this.validateApiCallData<CreateCampaignData>('console-create-campaign-data', data)

    return await this.campaignService.createCampaign(data)
  }

  private readCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<ReadCampaignData>('console-read-campaign-data', data)

    return await this.campaignService.readCampaign(data)
  }

  private updateCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<UpdateCampaignData>('console-update-campaign-data', data)

    return await this.campaignService.updateCampaign(data)
  }

  private deleteCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateApiCallData<DeleteCampaignData>('console-delete-campaign-data', data)

    return await this.campaignService.deleteCampaign(data)
  }

  private listCampaignsApiCall: ReplServerApiCall = async () => {
    return await this.campaignService.listCampaigns()
  }
}
