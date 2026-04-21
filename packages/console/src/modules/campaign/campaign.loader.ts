import { DIComposer } from '@famir/common'
import { CampaignController } from './campaign.controller.js'
import { CampaignService } from './campaign.service.js'

/**
 * @category Campaign
 */
export const registerCampaign: DIComposer = (container) => {
  CampaignService.register(container)

  CampaignController.register(container)
}
