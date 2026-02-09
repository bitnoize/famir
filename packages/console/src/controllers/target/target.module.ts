import { DIContainer } from '@famir/common'
import { TargetController } from './target.controller.js'
import { TargetService } from './target.service.js'

export const composeTargetModule = (container: DIContainer): TargetController => {
  TargetService.inject(container)

  TargetController.inject(container)

  return TargetController.resolve(container)
}
