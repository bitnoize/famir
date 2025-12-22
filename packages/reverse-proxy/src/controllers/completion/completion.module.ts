import { DIContainer } from '@famir/common'
import { CompletionController } from './completion.controller.js'
import { CompletionService } from './completion.service.js'

export const composeCompletionModule = (container: DIContainer) => {
  CompletionService.inject(container)

  CompletionController.inject(container)

  CompletionController.resolve(container).addMiddlewares()
}
