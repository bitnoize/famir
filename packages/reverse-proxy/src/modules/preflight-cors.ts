import { DIContainer } from '@famir/common'
import { HttpServerRouter, Logger, Validator } from '@famir/domain'
import { PreflightCorsController } from '../controllers/index.js'

export const composePreflightCors = (container: DIContainer) => {
  container.registerSingleton<PreflightCorsController>(
    'PreflightCorsController',
    (c) =>
      new PreflightCorsController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<HttpServerRouter>('HttpServerRouter')
      )
  )

  container.resolve<PreflightCorsController>('PreflightCorsController')
}
