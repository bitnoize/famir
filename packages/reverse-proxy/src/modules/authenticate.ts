import { DIContainer } from '@famir/common'
import { AuthenticateController } from '../controllers/index.js'

export const composeAuthenticate = (container: DIContainer) => {
  AuthenticateController.inject(container)

  AuthenticateController.resolve(container)
}
