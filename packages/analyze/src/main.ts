import { DIComposer } from '@famir/common'
import { DefaultController } from './controllers/index.js'
import { ReadMessageUseCase, SaveMessageUseCase } from './use-cases/index.js'

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
  console.error(`Unhandled rejection`, { reason, p })

  process.exit(1)
})

process.on('uncaughtException', (error: unknown) => {
  console.error(`Uncaught exception`, { error })

  process.exit(1)
})

/**
 * @category none
 * @internal
 */
export const autoLoad: DIComposer = (container) => {
  ReadMessageUseCase.register(container)
  SaveMessageUseCase.register(container)

  DefaultController.register(container)
}
