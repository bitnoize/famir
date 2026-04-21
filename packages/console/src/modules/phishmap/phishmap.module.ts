import { DIComposer } from '@famir/common'
import { PhishmapController } from './phishmap.controller.js'
import { PhishmapService } from './phishmap.service.js'

/**
 * @category Phishmap
 */
export const composePhishmap: DIComposer = (container) => {
  PhishmapService.register(container)

  PhishmapController.register(container)
}
