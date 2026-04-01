import { DIComposer } from '@famir/common'
import { DefaultController } from './controllers/index.js'
import { ReadMessageUseCase, SaveMessageUseCase } from './use-cases/index.js'

export const autoLoad: DIComposer = (container) => {
  ReadMessageUseCase.register(container)
  SaveMessageUseCase.register(container)

  DefaultController.register(container)
}
