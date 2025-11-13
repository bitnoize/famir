import { DIContainer } from '@famir/common'
import { LureController } from './lure.controller.js'
import { LureService } from './lure.service.js'

export const composeLureModule = (container: DIContainer) => {
  LureService.inject(container)

  LureController.inject(container)

  LureController.resolve(container)
}
