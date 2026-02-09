import { DIContainer } from '@famir/common'
import { LureController } from './lure.controller.js'
import { LureService } from './lure.service.js'

export const composeLureModule = (container: DIContainer): LureController => {
  LureService.inject(container)

  LureController.inject(container)

  return LureController.resolve(container)
}
