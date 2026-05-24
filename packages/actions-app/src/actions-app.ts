import { DIContainer, serializeError } from '@famir/common'
import {
  ANALYZE_WORKER,
  AnalyzeWorker,
  CONSUMER_CONNECTOR,
  CONSUMER_ROUTER,
  ConsumerConnector,
  ConsumerRouter,
} from '@famir/consumer'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { PRODUCER_CONNECTOR, ProducerConnector } from '@famir/producer'

/**
 * DI token for the actions application.
 *
 * @category none
 */
export const ACTIONS_APP = Symbol('ActionsApp')

/**
 * Represents the actions application.
 *
 * Depends:
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 * - {@link ConsumerConnector} via {@link CONSUMER_CONNECTOR} token
 * - {@link ConsumerRouter} via {@link CONSUMER_ROUTER} token
 * - {@link AnalyzeWorker} via {@link ANALYZE_WORKER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { ActionsApp } from '@famir/actions-app'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register all dependencies
 * // ...
 *
 * // Resolve and start the application
 * const app = ActionsApp.resolve(container)
 * await app.start()
 * ```
 *
 * @category none
 */
export class ActionsApp {
  /**
   * Registers the application as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ActionsApp>(
      ACTIONS_APP,
      (c) =>
        new ActionsApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<ProducerConnector>(PRODUCER_CONNECTOR),
          c.resolve<ConsumerConnector>(CONSUMER_CONNECTOR),
          c.resolve<ConsumerRouter>(CONSUMER_ROUTER),
          c.resolve<AnalyzeWorker>(ANALYZE_WORKER)
        )
    )
  }

  /**
   * Resolves the application from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The application instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ActionsApp>(ACTIONS_APP)
  }

  /**
   * Creates a new application instance.
   *
   * @param logger - The logger instance.
   * @param databaseConnector - The database connector instance.
   * @param producerConnector - The producer connector instance.
   * @param consumerConnector - The consumer connector instance.
   * @param router - The consumer router instance.
   * @param analyzeWorker - The analyze worker instance.
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly producerConnector: ProducerConnector,
    protected readonly consumerConnector: ConsumerConnector,
    protected readonly router: ConsumerRouter,
    protected readonly analyzeWorker: AnalyzeWorker
  ) {}

  /**
   * Starts the application.
   */
  async start(): Promise<void> {
    try {
      this.router.activate()

      await this.databaseConnector.connect()

      await this.analyzeWorker.run()

      this.logger.debug(`Application started`)
    } catch (error) {
      this.logger.error(`Application start failed`, {
        error: serializeError(error),
      })

      throw error
    }
  }

  /**
   * Stops the application.
   */
  async stop(): Promise<void> {
    try {
      await this.analyzeWorker.close()

      await this.consumerConnector.close()

      await this.producerConnector.close()

      await this.databaseConnector.close()

      this.logger.debug(`Application stopped`)
    } catch (error) {
      this.logger.error(`Application stop failed`, {
        error: serializeError(error),
      })

      throw error
    }
  }
}
