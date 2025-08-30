import { DIContainer } from '@famir/common'
import { Router } from '@famir/http-server'
import { PreflightCorsController } from '../controllers/index.js'

export const composePreflightCors = (container: DIContainer) => {
  container.registerSingleton<PreflightCorsController>(
    'PreflightCorsController',
    (c) => new PreflightCorsController(c.resolve<Router>('MainRouter'))
  )

  container.resolve<PreflightCorsController>('PreflightCorsController')
}
