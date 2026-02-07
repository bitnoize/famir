import { DIContainer } from '@famir/common'
import { AuthorizeController } from './authorize.controller.js'
import { AuthorizeService } from './authorize.service.js'

export const composeAuthorizeModule = (container: DIContainer): AuthorizeController => {
  AuthorizeService.inject(container)

  AuthorizeController.inject(container)

  return AuthorizeController.resolve(container)
}
