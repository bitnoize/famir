import { DIContainer } from '@famir/common'
import { LureController } from '../controllers/index.js'
import {
  CreateLureUseCase,
  DeleteLureUseCase,
  DisableLureUseCase,
  EnableLureUseCase,
  ListLuresUseCase,
  ReadLureUseCase
} from '../use-cases/index.js'

export const composeLure = (container: DIContainer) => {
  CreateLureUseCase.inject(container)
  ReadLureUseCase.inject(container)
  EnableLureUseCase.inject(container)
  DisableLureUseCase.inject(container)
  DeleteLureUseCase.inject(container)
  ListLuresUseCase.inject(container)

  LureController.inject(container)

  LureController.resolve(container)
}
