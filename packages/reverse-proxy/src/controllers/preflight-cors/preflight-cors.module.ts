import { DIContainer } from '@famir/common'
import { PreflightCorsController } from './preflight-cors.controller.js'

export const composePreflightCors = (container: DIContainer) => {
  PreflightCorsController.inject(container)

  PreflightCorsController.resolve(container)
}
