import { DIContainer } from '@famir/common'
import { CampaignRepository, ExecutorDispatcher, Logger, Validator } from '@famir/domain'
import { DummyController } from '../controllers/index.js'
import { DummyExampleUseCase } from '../use-cases/index.js'

export const composeDummy = (container: DIContainer) => {
  container.registerSingleton<DummyExampleUseCase>(
    'DummyExampleUseCase',
    (c) => new DummyExampleUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<DummyController>(
    'DummyController',
    (c) =>
      new DummyController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<ExecutorDispatcher>('ExecutorDispatcher'),
        c.resolve<DummyExampleUseCase>('DummyExampleUseCase')
      )
  )

  container.resolve<DummyController>('DummyController')
}
