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
  FindCampaignTargetUseCase,
  FindLureRedirectorUseCase,
  ForwardSimpleUseCase,
  ForwardStreamRequestUseCase,
  ForwardStreamResponseUseCase,
  ReadProxyUseCase,
  UpgradeSessionUseCase
} from './use-cases/index.js'

export const autoLoad: DIComposer = (container) => {
  FindCampaignTargetUseCase.inject(container)
  ReadProxyUseCase.inject(container)
  FindLureRedirectorUseCase.inject(container)
  CreateSessionUseCase.inject(container)
  AuthSessionUseCase.inject(container)
  UpgradeSessionUseCase.inject(container)
  CreateMessageUseCase.inject(container)
  ForwardSimpleUseCase.inject(container)
  ForwardStreamRequestUseCase.inject(container)
  ForwardStreamResponseUseCase.inject(container)

  SetupMirrorController.inject(container)
  WellKnownUrlsController.inject(container)
  AuthorizeController.inject(container)
  TransformController.inject(container)
  RoundTripController.inject(container)
  CompleteController.inject(container)
}
