import { DIContainer } from '@famir/common'
import { CampaignController } from './campaign.controller.js'
import { CampaignService } from './campaign.service.js'

export const composeCampaignModule = (container: DIContainer): CampaignController => {
  CampaignService.inject(container)

  CampaignController.inject(container)

  return CampaignController.resolve(container)
}
