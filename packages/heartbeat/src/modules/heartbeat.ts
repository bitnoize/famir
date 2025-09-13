import { DIContainer } from '@famir/common'
import { Logger } from '@famir/logger'
import { HeartbeatManager } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { HeartbeatController } from '../controllers/index.js'
import { ScanSessionsUseCase, ScanMessagesUseCase } from '../use-cases/index.js'
import { SessionRepository, MessageRepository } from '@famir/domain'

export const composeHeartbeat = (container: DIContainer) => {
  container.registerSingleton<ScanSessionsUseCase>(
    'ScanSessionsUseCase',
    (c) => new ScanSessionsUseCase(c.resolve<SessionRepository>('SessionRepository'))
  )

  container.registerSingleton<ScanMessagesUseCase>(
    'ScanMessagesUseCase',
    (c) => new ScanMessagesUseCase(c.resolve<MessageRepository>('MessageRepository'))
  )

  container.registerSingleton<HeartbeatController>(
    'HeartbeatController',
    (c) =>
      new HeartbeatController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<HeartbeatManager>('HeartbeatManager'),
        c.resolve<ScanSessionsUseCase>('ScanSessionsUseCase'),
        c.resolve<ScanMessagesUseCase>('ScanMessagesUseCase'),
      )
  )

  container.resolve<HeartbeatController>('HeartbeatController')
}
