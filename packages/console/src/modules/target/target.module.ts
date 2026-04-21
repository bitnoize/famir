import { DIComposer } from '@famir/common'
import { TargetController } from './target.controller.js'
import { TargetService } from './target.service.js'

/**
 * @category Target
 */
export const composeTarget: DIComposer = (container) => {
  TargetService.register(container)

  TargetController.register(container)
}
