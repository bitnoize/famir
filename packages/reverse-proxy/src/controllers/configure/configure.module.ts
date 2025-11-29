import { DIContainer } from '@famir/common'
import { ConfigureController } from './configure.controller.js'
import { ConfigureUseCase } from './configure.use-case.js'

export const composeConfigureModule = (container: DIContainer) => {
  ConfigureUseCase.inject(container)

  ConfigureController.inject(container)

  ConfigureController.resolve(container)
}
