import { DIContainer } from '@famir/common'
import { SetupMirrorController } from './setup-mirror.controller.js'
import { GetTargetUseCase } from './use-cases/index.js'

export const composeSetupMirrorModule = (container: DIContainer) => {
  GetTargetUseCase.inject(container)

  SetupMirrorController.inject(container)

  SetupMirrorController.resolve(container)
}
