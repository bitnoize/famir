import { DIContainer } from '@famir/common'
import {
  CampaignRepository,
  HttpServerRouter,
  Logger,
  TargetRepository,
  Validator
} from '@famir/domain'
import { ConfigurationController } from '../controllers/index.js'
import { ConfigurationUseCase } from '../use-cases/index.js'

export const composeConfiguration = (container: DIContainer) => {
  container.registerSingleton<ConfigurationUseCase>(
    'ConfigurationUseCase',
    (c) =>
      new ConfigurationUseCase(
        c.resolve<CampaignRepository>('CampaignRepository'),
        c.resolve<TargetRepository>('TargetRepository')
      )
  )

  container.registerSingleton<ConfigurationController>(
    'ConfigurationController',
    (c) =>
      new ConfigurationController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<HttpServerRouter>('HttpServerRouter'),
        c.resolve<ConfigurationUseCase>('ConfigurationUseCase')
      )
  )

  container.resolve<ConfigurationController>('ConfigurationController')
}
