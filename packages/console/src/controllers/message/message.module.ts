import { DIContainer } from '@famir/common'
import { MessageController } from './message.controller.js'
import { MessageService } from './message.service.js'

export const composeMessageModule = (container: DIContainer): MessageController => {
  MessageService.inject(container)

  MessageController.inject(container)

  return MessageController.resolve(container)
}
