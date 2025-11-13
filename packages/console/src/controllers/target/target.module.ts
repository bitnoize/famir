import { DIContainer } from '@famir/common'
import { TargetController } from './target.controller.js'
import { TargetService } from './target.service.js'

export const composeTargetModule = (container: DIContainer) => {
  TargetService.inject(container)

  TargetController.inject(container)

  TargetController.resolve(container)
}
