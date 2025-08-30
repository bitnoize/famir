import { DIContainer } from '@famir/common'
import { TargetRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Context } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import { TargetController } from '../controllers/index.js'
import {
  CreateTargetUseCase,
  DeleteTargetUseCase,
  DisableTargetUseCase,
  EnableTargetUseCase,
  ListTargetsUseCase,
  ReadTargetUseCase,
  UpdateTargetUseCase
} from '../use-cases/index.js'

export const composeTarget = (container: DIContainer) => {
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

  container.resolve<TargetController>('TargetController')
}
