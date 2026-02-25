import { DIContainer } from '@famir/common'
import { WellKnownUrlsController } from './well-known-urls.controller.js'

export const composeWellKnownUrlsModule = (container: DIContainer): WellKnownUrlsController => {
  WellKnownUrlsController.inject(container)

  return WellKnownUrlsController.resolve(container)
}
