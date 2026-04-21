import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import {
  CAMPAIGN_CONTROLLER,
  CAMPAIGN_SERVICE,
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData,
} from './campaign.js'
import { campaignSchemas } from './campaign.schemas.js'
import { type CampaignService } from './campaign.service.js'

/**
 * Campaign controller
 * @category Controllers
 */
export class CampaignController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
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

  /**
   * Resolve dependency
   */
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

  use() {
    this.router.addApiCall('createCampaign', async (data) => {
      this.validateData<CreateCampaignData>('console-create-campaign-data', data)

      return await this.campaignService.create(data)
    })

    this.router.addApiCall('readCampaign', async (data) => {
      this.validateData<ReadCampaignData>('console-read-campaign-data', data)

      return await this.campaignService.read(data)
    })

    this.router.addApiCall('readCampaignShare', async () => {
      return await this.campaignService.readShare()
    })

    this.router.addApiCall('lockCampaign', async (data) => {
      this.validateData<LockCampaignData>('console-lock-campaign-data', data)

      return await this.campaignService.lock(data)
    })

    this.router.addApiCall('unlockCampaign', async (data) => {
      this.validateData<UnlockCampaignData>('console-unlock-campaign-data', data)

      return await this.campaignService.unlock(data)
    })

    this.router.addApiCall('updateCampaign', async (data) => {
      this.validateData<UpdateCampaignData>('console-update-campaign-data', data)

      return await this.campaignService.update(data)
    })

    this.router.addApiCall('deleteCampaign', async (data) => {
      this.validateData<DeleteCampaignData>('console-delete-campaign-data', data)

      return await this.campaignService.delete(data)
    })

    this.router.addApiCall('listCampaigns', async () => {
      return await this.campaignService.list()
    })
  }
}
