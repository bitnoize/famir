import { DIContainer, serializeError } from '@famir/common'
import {
  ANALYZE_WORKER,
  AnalyzeWorker,
  CONSUME_CONNECTOR,
  CONSUME_ROUTER,
  ConsumeConnector,
  ConsumeRouter,
} from '@famir/consume'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { PRODUCE_CONNECTOR, ProduceConnector } from '@famir/produce'

/**
 * @category none
 * @internal
 */
export const ACTIONS_APP = Symbol('ActionsApp')

/**
 * Represents an actions app
 *
 * @category none
 */
export class ActionsApp {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ActionsApp>(
      ACTIONS_APP,
      (c) =>
        new ActionsApp(
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR),
          c.resolve(PRODUCE_CONNECTOR),
          c.resolve(CONSUME_CONNECTOR),
          c.resolve(CONSUME_ROUTER),
          c.resolve(ANALYZE_WORKER)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): ActionsApp {
    return container.resolve(ACTIONS_APP)
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly produceConnector: ProduceConnector,
    protected readonly consumeConnector: ConsumeConnector,
    protected readonly router: ConsumeRouter,
    protected readonly analyzeWorker: AnalyzeWorker
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

      await this.analyzeWorker.run()

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
      await this.analyzeWorker.close()

      await this.consumeConnector.close()

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
