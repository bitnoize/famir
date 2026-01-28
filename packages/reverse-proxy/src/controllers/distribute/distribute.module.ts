import { DIContainer } from '@famir/common'
import { DistributeController } from './distribute.controller.js'

export const composeDistributeModule = (container: DIContainer) => {
  DistributeController.inject(container)

  DistributeController.resolve(container)
}
