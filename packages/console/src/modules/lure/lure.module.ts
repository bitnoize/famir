import { DIComposer } from '@famir/common'
import { LureController } from './lure.controller.js'
import { LureService } from './lure.service.js'

/**
 * @category Lure
 */
export const composeLure: DIComposer = (container) => {
  LureService.register(container)

  LureController.register(container)
}
