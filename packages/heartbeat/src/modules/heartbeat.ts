import { DIContainer } from '@famir/common'
import { Logger } from '@famir/logger'
import { HeartbeatDispatcher } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { HeartbeatController } from '../controllers/index.js'

export const composeHeartbeat = (container: DIContainer) => {
  container.registerSingleton<HeartbeatController>(
    'HeartbeatController',
    (c) =>
      new HeartbeatController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<HeartbeatDispatcher>('HeartbeatDispatcher')
      )
  )

  container.resolve<HeartbeatController>('HeartbeatController')
}
