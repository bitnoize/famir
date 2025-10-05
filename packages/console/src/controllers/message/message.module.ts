import { DIContainer } from '@famir/common'
import { MessageController } from './message.controller.js'
import { ReadMessageUseCase } from './use-cases/index.js'

export const composeMessage = (container: DIContainer) => {
  ReadMessageUseCase.inject(container)

  MessageController.inject(container)

  MessageController.resolve(container)
}
