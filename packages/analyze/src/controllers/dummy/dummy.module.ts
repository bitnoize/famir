import { DIContainer } from '@famir/common'
import { DummyController } from './dummy.controller.js'
import { DummyService } from './dummy.service.js'

export const composeDummyModule = (container: DIContainer): DummyController => {
  DummyService.inject(container)

  DummyController.inject(container)

  return DummyController.resolve(container)
}
