import { DIComposer } from '@famir/common'
import { DummyController } from './controllers/index.js'
import { ReadMessageUseCase, SaveMessageUseCase } from './use-cases/index.js'

export const autoLoad: DIComposer = (container) => {
  ReadMessageUseCase.inject(container)
  SaveMessageUseCase.inject(container)

  DummyController.inject(container)
}
