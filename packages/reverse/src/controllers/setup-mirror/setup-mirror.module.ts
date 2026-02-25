import { DIContainer } from '@famir/common'
import { SetupMirrorController } from './setup-mirror.controller.js'
import { SetupMirrorService } from './setup-mirror.service.js'

export const composeSetupMirrorModule = (container: DIContainer): SetupMirrorController => {
  SetupMirrorService.inject(container)

  SetupMirrorController.inject(container)

  return SetupMirrorController.resolve(container)
}
