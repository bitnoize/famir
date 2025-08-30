import { DIContainer } from '@famir/common'
import { CampaignRepository, TargetRepository } from '@famir/domain'
import { Router } from '@famir/http-server'
import { Validator } from '@famir/validator'
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
        c.resolve<Router>('MainRouter'),
        c.resolve<GatewayUseCase>('GatewayUseCase')
      )
  )

  container.resolve<GatewayController>('GatewayController')
}
