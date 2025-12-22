import { DIContainer } from '@famir/common'
import { SetupMirrorController } from './setup-mirror.controller.js'
import { SetupMirrorService } from './setup-mirror.service.js'

export const composeSetupMirrorModule = (container: DIContainer) => {
  SetupMirrorService.inject(container)

  SetupMirrorController.inject(container)

  SetupMirrorController.resolve(container).addMiddlewares()
}
