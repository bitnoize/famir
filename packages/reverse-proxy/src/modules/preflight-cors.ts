import { DIContainer } from '@famir/common'
import { PreflightCorsController } from '../controllers/index.js'

export const composePreflightCors = (container: DIContainer) => {
  PreflightCorsController.inject(container)

  PreflightCorsController.resolve(container)
}
