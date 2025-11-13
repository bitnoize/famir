import { DIContainer } from '@famir/common'
import { SetupMirrorController } from './setup-mirror.controller.js'
import { GetCampaignTargetUseCase } from './use-cases/get-campaign-target/index.js'

export const composeSetupMirrorModule = (container: DIContainer) => {
  GetCampaignTargetUseCase.inject(container)

  SetupMirrorController.inject(container)

  SetupMirrorController.resolve(container)
}
