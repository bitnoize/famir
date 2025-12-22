import { DIContainer } from '@famir/common'
import { WellKnownUrlsController } from './well-known-urls.controller.js'

export const composeWellKnownUrlsModule = (container: DIContainer) => {
  WellKnownUrlsController.inject(container)

  WellKnownUrlsController.resolve(container).addMiddlewares()
}
