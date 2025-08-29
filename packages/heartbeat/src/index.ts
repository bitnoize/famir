import { DIContainer } from '@famir/common'
import { Logger } from '@famir/logger'
import { HeartbeatDispatcher } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { HeartbeatController } from './heartbeat.controller.js'
import { main } from './heartbeat.loader.js'

const setup = (container: DIContainer) => {
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

try {
  await main(setup)
} catch (error) {
  console.error(`Main error`, { error })

  process.exit(1)
}
