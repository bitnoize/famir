import { DIContainer } from '@famir/common'
import { CampaignController } from './campaign.controller.js'
import {
  CreateCampaignUseCase,
  DeleteCampaignUseCase,
  ListCampaignsUseCase,
  ReadCampaignUseCase,
  UpdateCampaignUseCase
} from './use-cases/index.js'

export const composeCampaign = (container: DIContainer) => {
  CreateCampaignUseCase.inject(container)
  ReadCampaignUseCase.inject(container)
  UpdateCampaignUseCase.inject(container)
  DeleteCampaignUseCase.inject(container)
  ListCampaignsUseCase.inject(container)

  CampaignController.inject(container)

  CampaignController.resolve(container)
}
