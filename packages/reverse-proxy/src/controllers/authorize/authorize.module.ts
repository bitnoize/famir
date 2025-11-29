import { DIContainer } from '@famir/common'
import { AuthorizeController } from './authorize.controller.js'
import { AuthLandingUseCase, AuthTransparentUseCase } from './use-cases/index.js'

export const composeAuthorizeModule = (container: DIContainer) => {
  //AuthLandingUseCase.inject(container)
  //AuthTransparentUseCase.inject(container)

  AuthorizeController.inject(container)

  AuthorizeController.resolve(container)
}
