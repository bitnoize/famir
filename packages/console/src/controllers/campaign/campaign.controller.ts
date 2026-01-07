import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
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
import { campaignSchemas } from './campaign.schemas.js'
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

    this.validator.addSchemas(campaignSchemas)

    this.router.register('createCampaign', this.createCampaign)
    this.router.register('readCampaign', this.readCampaign)
    this.router.register('updateCampaign', this.updateCampaign)
    this.router.register('deleteCampaign', this.deleteCampaign)
    this.router.register('listCampaigns', this.listCampaigns)

    this.logger.debug(`CampaignController initialized`)
  }

  private createCampaign: ReplServerApiCall = async (data) => {
    this.validateData<CreateCampaignData>('console-create-campaign-data', data)

    return await this.campaignService.createCampaign(data)
  }

  private readCampaign: ReplServerApiCall = async (data) => {
    this.validateData<ReadCampaignData>('console-read-campaign-data', data)

    return await this.campaignService.readCampaign(data)
  }

  private updateCampaign: ReplServerApiCall = async (data) => {
    this.validateData<UpdateCampaignData>('console-update-campaign-data', data)

    return await this.campaignService.updateCampaign(data)
  }

  private deleteCampaign: ReplServerApiCall = async (data) => {
    this.validateData<DeleteCampaignData>('console-delete-campaign-data', data)

    return await this.campaignService.deleteCampaign(data)
  }

  private listCampaigns: ReplServerApiCall = async () => {
    return await this.campaignService.listCampaigns()
  }
}
