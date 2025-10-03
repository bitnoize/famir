import { DIContainer } from '@famir/common'
import { DummyController } from '../controllers/index.js'
import { DummyExampleUseCase } from '../use-cases/index.js'

export const composeDummy = (container: DIContainer) => {
  DummyExampleUseCase.inject(container)

  DummyController.inject(container)

  DummyController.resolve(container)
}
