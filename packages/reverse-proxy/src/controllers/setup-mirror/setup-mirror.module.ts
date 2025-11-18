import { DIContainer } from '@famir/common'
import { SetupMirrorController } from './setup-mirror.controller.js'
import { SetupMirrorUseCase } from './use-cases/index.js'

export const composeSetupMirrorModule = (container: DIContainer) => {
  SetupMirrorUseCase.inject(container)

  SetupMirrorController.inject(container)

  SetupMirrorController.resolve(container)
}
