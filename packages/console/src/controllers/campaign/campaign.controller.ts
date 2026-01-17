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
    this.router.register('lockCampaign', this.lockCampaign)
    this.router.register('unlockCampaign', this.unlockCampaign)
    this.router.register('updateCampaign', this.updateCampaign)
    this.router.register('deleteCampaign', this.deleteCampaign)
    this.router.register('listCampaigns', this.listCampaigns)

    this.logger.debug(`CampaignController initialized`)
  }

  private createCampaign: ReplServerApiCall = async (data) => {
    this.validateData<CreateCampaignData>('console-create-campaign-data', data)

    return await this.campaignService.create(data)
  }

  private readCampaign: ReplServerApiCall = async (data) => {
    this.validateData<ReadCampaignData>('console-read-campaign-data', data)

    return await this.campaignService.read(data)
  }

  private lockCampaign: ReplServerApiCall = async (data) => {
    this.validateData<LockCampaignData>('console-lock-campaign-data', data)

    return await this.campaignService.lock(data)
  }

  private unlockCampaign: ReplServerApiCall = async (data) => {
    this.validateData<UnlockCampaignData>('console-unlock-campaign-data', data)

    await this.campaignService.unlock(data)

    return true
  }

  private updateCampaign: ReplServerApiCall = async (data) => {
    this.validateData<UpdateCampaignData>('console-update-campaign-data', data)

    await this.campaignService.update(data)

    return true
  }

  private deleteCampaign: ReplServerApiCall = async (data) => {
    this.validateData<DeleteCampaignData>('console-delete-campaign-data', data)

    await this.campaignService.delete(data)

    return true
  }

  private listCampaigns: ReplServerApiCall = async () => {
    return await this.campaignService.list()
  }
}
