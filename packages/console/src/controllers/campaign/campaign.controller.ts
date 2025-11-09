import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerRegistry,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { CAMPAIGN_SERVICE, CampaignService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import {
  addSchemas,
  validateCreateCampaignModel,
  validateDeleteCampaignModel,
  validateReadCampaignModel,
  validateUpdateCampaignModel
} from './campaign.utils.js'

export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

export class CampaignController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<CampaignController>(
      CAMPAIGN_CONTROLLER,
      (c) =>
        new CampaignController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
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
    registry: ReplServerRegistry,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, 'campaign')

    validator.addSchemas(addSchemas)

    registry.addApiCall('createCampaign', this.createCampaignApiCall)
    registry.addApiCall('readCampaign', this.readCampaignApiCall)
    registry.addApiCall('updateCampaign', this.updateCampaignApiCall)
    registry.addApiCall('deleteCampaign', this.deleteCampaignApiCall)
    registry.addApiCall('listCampaigns', this.listCampaignsApiCall)

    this.logger.debug(`CampaignController initialized`)
  }

  private readonly createCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      validateCreateCampaignModel(this.assertSchema, data)

      return await this.campaignService.create(data)
    } catch (error) {
      this.handleException(error, 'createCampaign', data)
    }
  }

  private readonly readCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadCampaignModel(this.assertSchema, data)

      return await this.campaignService.read(data)
    } catch (error) {
      this.handleException(error, 'readCampaign', data)
    }
  }

  private readonly updateCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      validateUpdateCampaignModel(this.assertSchema, data)

      return await this.campaignService.update(data)
    } catch (error) {
      this.handleException(error, 'updateCampaign', data)
    }
  }

  private readonly deleteCampaignApiCall: ReplServerApiCall = async (data) => {
    try {
      validateDeleteCampaignModel(this.assertSchema, data)

      return await this.campaignService.delete(data)
    } catch (error) {
      this.handleException(error, 'deleteCampaign', data)
    }
  }

  private readonly listCampaignsApiCall: ReplServerApiCall = async () => {
    try {
      return await this.campaignService.list()
    } catch (error) {
      this.handleException(error, 'listCampaigns', null)
    }
  }
}
