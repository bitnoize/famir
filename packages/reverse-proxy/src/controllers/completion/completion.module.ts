import { DIContainer } from '@famir/common'
import { CompletionController } from './completion.controller.js'
import { CompletionService } from './completion.service.js'

export const composeCompletionModule = (container: DIContainer): CompletionController => {
  CompletionService.inject(container)

  CompletionController.inject(container)

  return CompletionController.resolve(container)
}
