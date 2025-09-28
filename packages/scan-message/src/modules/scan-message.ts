import { DIContainer } from '@famir/common'
import {
  Logger,
  ScanMessageManager,
  Validator,
} from '@famir/domain'
import { ScanMessageController } from '../controllers/index.js'

export const composeScanMessage = (container: DIContainer) => {
  container.registerSingleton<ScanMessageController>(
    'ScanMessageController',
    (c) =>
      new ScanMessageController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<ScanMessageManager>('ScanMessageManager')
      )
  )

  container.resolve<ScanMessageController>('ScanMessageController')
}
