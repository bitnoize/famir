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
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData
} from './campaign.js'
import { campaignSchemas } from './campaign.schemas.js'
import { CAMPAIGN_SERVICE, type CampaignService } from './campaign.service.js'

export const CAMPAIGN_CONTROLLER = Symbol('CampaignController')

export class CampaignController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
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
    return container.resolve(CAMPAIGN_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly campaignService: CampaignService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(campaignSchemas)

    this.logger.debug(`CampaignController initialized`)
  }

  register(): this {
    this.router
      .register('createCampaign', this.createCampaignApiCall)
      .register('readCampaign', this.readCampaignApiCall)
      .register('lockCampaign', this.lockCampaignApiCall)
      .register('unlockCampaign', this.unlockCampaignApiCall)
      .register('updateCampaign', this.updateCampaignApiCall)
      .register('deleteCampaign', this.deleteCampaignApiCall)
      .register('listCampaigns', this.listCampaignsApiCall)

    return this
  }

  private createCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<CreateCampaignData>('console-create-campaign-data', data)

    return await this.campaignService.create(data)
  }

  private readCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<ReadCampaignData>('console-read-campaign-data', data)

    return await this.campaignService.read(data)
  }

  private lockCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<LockCampaignData>('console-lock-campaign-data', data)

    return await this.campaignService.lock(data)
  }

  private unlockCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UnlockCampaignData>('console-unlock-campaign-data', data)

    await this.campaignService.unlock(data)

    return true
  }

  private updateCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<UpdateCampaignData>('console-update-campaign-data', data)

    await this.campaignService.update(data)

    return true
  }

  private deleteCampaignApiCall: ReplServerApiCall = async (data) => {
    this.validateData<DeleteCampaignData>('console-delete-campaign-data', data)

    await this.campaignService.delete(data)

    return true
  }

  private listCampaignsApiCall: ReplServerApiCall = async () => {
    return await this.campaignService.list()
  }
}
