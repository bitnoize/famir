import { DIContainer } from '@famir/common'
import { TargetController } from '../controllers/index.js'
import {
  CreateTargetUseCase,
  DeleteTargetUseCase,
  DisableTargetUseCase,
  EnableTargetUseCase,
  ListTargetsUseCase,
  ReadTargetUseCase,
  UpdateTargetUseCase
} from '../use-cases/index.js'

export const composeTarget = (container: DIContainer) => {
  CreateTargetUseCase.inject(container)
  ReadTargetUseCase.inject(container)
  UpdateTargetUseCase.inject(container)
  EnableTargetUseCase.inject(container)
  DisableTargetUseCase.inject(container)
  DeleteTargetUseCase.inject(container)
  ListTargetsUseCase.inject(container)

  TargetController.inject(container)

  TargetController.resolve(container)
}
