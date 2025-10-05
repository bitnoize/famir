import { DIContainer } from '@famir/common'
import { ConfigurationController } from './configuration.controller.js'
import { ConfigurationUseCase } from './use-cases/index.js'

export const composeConfiguration = (container: DIContainer) => {
  ConfigurationUseCase.inject(container)

  ConfigurationController.inject(container)

  ConfigurationController.resolve(container)
}
