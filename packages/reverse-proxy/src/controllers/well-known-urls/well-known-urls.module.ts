import { DIContainer } from '@famir/common'
import { WellKnownUrlsController } from './well-known-urls.controller.js'

export const composeWellKnownUrls = (container: DIContainer) => {
  WellKnownUrlsController.inject(container)

  WellKnownUrlsController.resolve(container)
}
