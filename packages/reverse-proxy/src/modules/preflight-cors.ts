import { DIContainer } from '@famir/common'
import { HttpServerRouter } from '@famir/domain'
import { PreflightCorsController } from '../controllers/index.js'

export const composePreflightCors = (container: DIContainer) => {
  container.registerSingleton<PreflightCorsController>(
    'PreflightCorsController',
    (c) => new PreflightCorsController(c.resolve<HttpServerRouter>('HttpServerRouter'))
  )

  container.resolve<PreflightCorsController>('PreflightCorsController')
}
