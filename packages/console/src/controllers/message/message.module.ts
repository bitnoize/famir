import { DIContainer } from '@famir/common'
import { MessageController } from './message.controller.js'
import { MessageService } from './message.service.js'

export const composeMessageModule = (container: DIContainer) => {
  MessageService.inject(container)

  MessageController.inject(container)

  MessageController.resolve(container)
}
