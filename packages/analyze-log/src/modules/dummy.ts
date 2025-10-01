import { DIContainer } from '@famir/common'
import {
  Logger,
  ExecutorRouter,
  Validator,
} from '@famir/domain'
import { SaveLogController } from '../controllers/index.js'

export const composeLogSave = (container: DIContainer) => {
  container.registerSingleton<SaveLogController>(
    'SaveLogController',
    (c) =>
      new SaveLogController(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<ExecutorRouter>('ExecutorRouter')
      )
  )

  container.resolve<SaveLogController>('SaveLogController')
}
