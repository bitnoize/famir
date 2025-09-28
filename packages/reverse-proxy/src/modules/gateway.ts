import { DIContainer } from '@famir/common'
import {
  CampaignRepository,
  TargetRepository,
  HttpServerRouter,
  Validator,
} from '@famir/domain'
import { GatewayController } from '../controllers/index.js'
import { GatewayUseCase } from '../use-cases/index.js'

export const composeGateway = (container: DIContainer) => {
  container.registerSingleton<GatewayUseCase>(
    'GatewayUseCase',
    (c) =>
      new GatewayUseCase(
        c.resolve<CampaignRepository>('CampaignRepository'),
        c.resolve<TargetRepository>('TargetRepository')
      )
  )

  container.registerSingleton<GatewayController>(
    'GatewayController',
    (c) =>
      new GatewayController(
        c.resolve<Validator>('Validator'),
        c.resolve<HttpServerRouter>('HttpServerRouter'),
        c.resolve<GatewayUseCase>('GatewayUseCase')
      )
  )

  container.resolve<GatewayController>('GatewayController')
}
