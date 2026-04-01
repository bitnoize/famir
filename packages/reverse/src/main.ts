import { DIComposer } from '@famir/common'
import {
  AuthorizeController,
  CompleteController,
  RoundTripController,
  SetupMirrorController,
  TransformController,
  WellKnownUrlsController
} from './controllers/index.js'
import {
  AuthSessionUseCase,
  CreateMessageUseCase,
  CreateSessionUseCase,
  FindLureRedirectorUseCase,
  FindTargetUseCase,
  ForwardSimpleUseCase,
  ForwardStreamRequestUseCase,
  ForwardStreamResponseUseCase,
  ReadProxyUseCase,
  UpgradeSessionUseCase
} from './use-cases/index.js'

export const autoLoad: DIComposer = (container) => {
  FindTargetUseCase.register(container)
  ReadProxyUseCase.register(container)
  FindLureRedirectorUseCase.register(container)
  CreateSessionUseCase.register(container)
  AuthSessionUseCase.register(container)
  UpgradeSessionUseCase.register(container)
  CreateMessageUseCase.register(container)
  ForwardSimpleUseCase.register(container)
  ForwardStreamRequestUseCase.register(container)
  ForwardStreamResponseUseCase.register(container)

  SetupMirrorController.register(container)
  WellKnownUrlsController.register(container)
  AuthorizeController.register(container)
  TransformController.register(container)
  RoundTripController.register(container)
  CompleteController.register(container)
}
