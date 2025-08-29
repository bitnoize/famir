import { DIContainer } from '@famir/common'
import { CampaignRepository, TargetRepository } from '@famir/domain'
import { Router } from '@famir/http-server'
import { PreflightCorsController } from './controllers/index.js'
import { main } from './reverse-proxy.loader.js'
import { GatewayUseCase } from './use-cases/index.js'

const setup = (container: DIContainer) => {
  container.registerSingleton<GatewayUseCase>(
    'GatewayUseCase',
    (c) =>
      new GatewayUseCase(
        c.resolve<CampaignRepository>('CampaignRepository'),
        c.resolve<TargetRepository>('TargetRepository')
      )
  )

  container.registerSingleton<PreflightCorsController>(
    'PreflightCorsController',
    (c) => new PreflightCorsController(c.resolve<Router>('MainRouter'))
  )

  container.resolve<PreflightCorsController>('PreflightCorsController')
}

try {
  await main(setup)
} catch (error) {
  console.error(`Main error`, { error })

  process.exit(1)
}
