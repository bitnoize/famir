import { DIContainer } from '@famir/common'
import { CampaignRepository, ProxyRepository, TargetRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import { CampaignController, ProxyController, TargetController } from './controllers/index.js'
import { main } from './shell.loader.js'
import {
  CreateCampaignUseCase,
  CreateProxyUseCase,
  CreateTargetUseCase,
  DeleteCampaignUseCase,
  DeleteProxyUseCase,
  DeleteTargetUseCase,
  DisableProxyUseCase,
  DisableTargetUseCase,
  EnableProxyUseCase,
  EnableTargetUseCase,
  ListProxiesUseCase,
  ListTargetsUseCase,
  ReadCampaignUseCase,
  ReadProxyUseCase,
  ReadTargetUseCase,
  UpdateCampaignUseCase,
  UpdateTargetUseCase
} from './use-cases/index.js'

const setup = (container: DIContainer) => {
  //
  // Campaign
  //

  container.registerSingleton<CreateCampaignUseCase>(
    'CreateCampaignUseCase',
    (c) => new CreateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<ReadCampaignUseCase>(
    'ReadCampaignUseCase',
    (c) => new ReadCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<UpdateCampaignUseCase>(
    'UpdateCampaignUseCase',
    (c) => new UpdateCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<DeleteCampaignUseCase>(
    'DeleteCampaignUseCase',
    (c) => new DeleteCampaignUseCase(c.resolve<CampaignRepository>('CampaignRepository'))
  )

  container.registerSingleton<CampaignController>(
    'CampaignController',
    (c) =>
      new CampaignController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context'),
        c.resolve<CreateCampaignUseCase>('CreateCampaignUseCase'),
        c.resolve<ReadCampaignUseCase>('ReadCampaignUseCase'),
        c.resolve<UpdateCampaignUseCase>('UpdateCampaignUseCase'),
        c.resolve<DeleteCampaignUseCase>('DeleteCampaignUseCase')
      )
  )

  //
  // Proxy
  //

  container.registerSingleton<CreateProxyUseCase>(
    'CreateProxyUseCase',
    (c) => new CreateProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ReadProxyUseCase>(
    'ReadProxyUseCase',
    (c) => new ReadProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<EnableProxyUseCase>(
    'EnableProxyUseCase',
    (c) => new EnableProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<DisableProxyUseCase>(
    'DisableProxyUseCase',
    (c) => new DisableProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<DeleteProxyUseCase>(
    'DeleteProxyUseCase',
    (c) => new DeleteProxyUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ListProxiesUseCase>(
    'ListProxiesUseCase',
    (c) => new ListProxiesUseCase(c.resolve<ProxyRepository>('ProxyRepository'))
  )

  container.registerSingleton<ProxyController>(
    'ProxyController',
    (c) =>
      new ProxyController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context'),
        c.resolve<CreateProxyUseCase>('CreateProxyUseCase'),
        c.resolve<ReadProxyUseCase>('ReadProxyUseCase'),
        c.resolve<EnableProxyUseCase>('EnableProxyUseCase'),
        c.resolve<DisableProxyUseCase>('DisableProxyUseCase'),
        c.resolve<DeleteProxyUseCase>('DeleteProxyUseCase'),
        c.resolve<ListProxiesUseCase>('ListProxiesUseCase')
      )
  )

  //
  // Target
  //

  container.registerSingleton<CreateTargetUseCase>(
    'CreateTargetUseCase',
    (c) => new CreateTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<ReadTargetUseCase>(
    'ReadTargetUseCase',
    (c) => new ReadTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<UpdateTargetUseCase>(
    'UpdateTargetUseCase',
    (c) => new UpdateTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<EnableTargetUseCase>(
    'EnableTargetUseCase',
    (c) => new EnableTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<DisableTargetUseCase>(
    'DisableTargetUseCase',
    (c) => new DisableTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<DeleteTargetUseCase>(
    'DeleteTargetUseCase',
    (c) => new DeleteTargetUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<ListTargetsUseCase>(
    'ListTargetsUseCase',
    (c) => new ListTargetsUseCase(c.resolve<TargetRepository>('TargetRepository'))
  )

  container.registerSingleton<TargetController>(
    'TargetController',
    (c) =>
      new TargetController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context'),
        c.resolve<CreateTargetUseCase>('CreateTargetUseCase'),
        c.resolve<ReadTargetUseCase>('ReadTargetUseCase'),
        c.resolve<UpdateTargetUseCase>('UpdateTargetUseCase'),
        c.resolve<EnableTargetUseCase>('EnableTargetUseCase'),
        c.resolve<DisableTargetUseCase>('DisableTargetUseCase'),
        c.resolve<DeleteTargetUseCase>('DeleteTargetUseCase'),
        c.resolve<ListTargetsUseCase>('ListTargetsUseCase')
      )
  )

  //
  // Initiate
  //

  container.resolve<CampaignController>('CampaignController')
  container.resolve<ProxyController>('ProxyController')
  container.resolve<TargetController>('TargetController')
}

try {
  await main(setup)
} catch (error) {
  console.error(`Main error`, { error })

  process.exit(1)
}
