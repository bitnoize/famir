import { DIContainer, serializeError } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE, AnalyzeQueue, PRODUCE_CONNECTOR, ProduceConnector } from '@famir/produce'
import { REPL_SERVER, REPL_SERVER_ROUTER, ReplServer, ReplServerRouter } from '@famir/repl-server'

/**
 * @category none
 * @internal
 */
export const CONSOLE_APP = Symbol('ConsoleApp')

/**
 * @category none
 * @internal
 */
//export const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const

/**
 * Represents a console app
 *
 * @category none
 */
export class ConsoleApp {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      CONSOLE_APP,
      (c) =>
        new ConsoleApp(
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR),
          c.resolve(PRODUCE_CONNECTOR),
          c.resolve(ANALYZE_QUEUE),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(REPL_SERVER)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): ConsoleApp {
    return container.resolve(CONSOLE_APP)
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly produceConnector: ProduceConnector,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly router: ReplServerRouter,
    protected readonly replServer: ReplServer
  ) {
    /*
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.once(signal, () => {
        this.stop().catch((error: unknown) => {
          this.logger.error(`App critical error`, {
            error: serializeError(error),
          })

          process.exit(2)
        })
      })
    })
    */

    this.logger.debug(`App initialized`)
  }

  /**
   * Start app
   */
  async start(): Promise<void> {
    try {
      this.router.activate()

      await this.databaseConnector.connect()

      await this.replServer.start()

      this.logger.debug(`App started`)
    } catch (error) {
      this.logger.error(`App start failed`, {
        error: serializeError(error),
      })

      process.exit(1)
    }
  }

  /**
   * Stop app
   */
  async stop(): Promise<void> {
    try {
      await this.replServer.stop()

      await this.analyzeQueue.close()

      await this.produceConnector.close()

      await this.databaseConnector.close()

      this.logger.debug(`App stopped`)
    } catch (error) {
      this.logger.error(`App stop failed`, {
        error: serializeError(error),
      })

      process.exit(1)
    }
  }
}
