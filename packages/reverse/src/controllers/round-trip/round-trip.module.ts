import { DIContainer } from '@famir/common'
import { RoundTripController } from './round-trip.controller.js'
import { RoundTripService } from './round-trip.service.js'

export const composeRoundTripModule = (container: DIContainer): RoundTripController => {
  RoundTripService.inject(container)

  RoundTripController.inject(container)

  return RoundTripController.resolve(container)
}
