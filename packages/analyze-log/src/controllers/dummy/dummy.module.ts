import { DIContainer } from '@famir/common'
import { DummyController } from './dummy.controller.js'
import { DummyUseCase } from './use-cases/index.js'

export const composeDummy = (container: DIContainer) => {
  DummyUseCase.inject(container)

  DummyController.inject(container)

  DummyController.resolve(container)
}
