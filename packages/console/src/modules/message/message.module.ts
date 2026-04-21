import { DIComposer } from '@famir/common'
import { MessageController } from './message.controller.js'
import { MessageService } from './message.service.js'

/**
 * @category Message
 */
export const composeMessage: DIComposer = (container) => {
  MessageService.register(container)

  MessageController.register(container)
}
