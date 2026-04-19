import { DIComposer } from '@famir/common'
import {
  AuthorizeController,
  CompleteController,
  RoundTripController,
  SetupMirrorController,
  TransformController,
  WellKnownUrlsController,
} from './controllers/index.js'
import {
  AuthSessionUseCase,
  CreateMessageUseCase,
  CreateSessionUseCase,
  FindLureUseCase,
  FindTargetUseCase,
  ForwardSimpleUseCase,
  ForwardStreamRequestUseCase,
  ForwardStreamResponseUseCase,
  ReadProxyUseCase,
  ReadRedirectorUseCase,
  UpgradeSessionUseCase,
} from './use-cases/index.js'

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
  console.error(`Unhandled rejection`, { reason, p })

  process.exit(1)
})

process.on('uncaughtException', (error: unknown) => {
  console.error(`Uncaught exception`, { error })

  process.exit(1)
})

export const autoLoad: DIComposer = (container) => {
  FindTargetUseCase.register(container)
  ReadProxyUseCase.register(container)
  ReadRedirectorUseCase.register(container)
  FindLureUseCase.register(container)
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
