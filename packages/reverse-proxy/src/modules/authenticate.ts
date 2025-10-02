import { DIContainer } from '@famir/common'
import { HttpServerRouter, Logger, Validator } from '@famir/domain'
import { AuthenticateController } from '../controllers/index.js'

export const composeAuthenticate = (container: DIContainer) => {
  container.registerSingleton<AuthenticateController>(
    'AuthenticateController',
    (c) =>
      new AuthenticateController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<HttpServerRouter>('HttpServerRouter')
      )
  )

  container.resolve<AuthenticateController>('AuthenticateController')
}
