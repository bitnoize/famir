import { DIContainer } from '@famir/common'
import { ConfigureController } from './configure.controller.js'
import { ConfigureService } from './configure.service.js'

export const composeConfigureModule = (container: DIContainer) => {
  ConfigureService.inject(container)

  ConfigureController.inject(container)

  ConfigureController.resolve(container)
}
