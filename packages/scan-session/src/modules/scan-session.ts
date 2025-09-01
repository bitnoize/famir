import { DIContainer } from '@famir/common'
import { Logger } from '@famir/logger'
import { ScanSessionManager } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { ScanSessionController } from '../controllers/index.js'

export const composeScanSession = (container: DIContainer) => {
  container.registerSingleton<ScanSessionController>(
    'ScanSessionController',
    (c) =>
      new ScanSessionController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<ScanSessionManager>('ScanSessionManager')
      )
  )

  container.resolve<ScanSessionController>('ScanSessionController')
}
