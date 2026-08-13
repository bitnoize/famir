import { CompositionRoot, DIContainer } from '@famir/common'

/**
 * Loads all infrastructure modules and starts/stops the application.
 *
 * @param root - The composition root object.
 *
 * @category none
 */
export function loader(root: CompositionRoot) {
  const container = DIContainer.getInstance()

  root.infra(container)

  root.start(container).catch((error: unknown) => {
    console.dir(error, { depth: 4 })

    process.exit(1)
  })

  const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT']

  SHUTDOWN_SIGNALS.forEach((signal) => {
    process.once(signal, () => {
      root.stop(container).catch((error: unknown) => {
        console.dir(error, { depth: 4 })

        process.exit(1)
      })
    })
  })
}

// Uncaught exception handler.
process.on('uncaughtException', (error: Error) => {
  console.error(`Uncaught exception`)
  console.dir(error, { depth: 4 })

  process.exit(2)
})

// Unhandled rejection handler.
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error(`Unhandled rejection`)
  console.dir({ reason, promise }, { depth: 4 })

  process.exit(2)
})
