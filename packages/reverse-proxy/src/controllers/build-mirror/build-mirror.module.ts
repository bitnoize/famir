import { DIContainer } from '@famir/common'
import { BuildMirrorController } from './build-mirror.controller.js'
import { ReadCampaignTargetUseCase } from './use-cases/index.js'

export const composeBuildMirror = (container: DIContainer) => {
  ReadCampaignTargetUseCase.inject(container)

  BuildMirrorController.inject(container)

  BuildMirrorController.resolve(container)
}
