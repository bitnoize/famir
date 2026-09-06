import { DIContainer, serializeError } from '@famir/common'
import { CONSUMER_ROUTER, type ConsumerRouter } from '@famir/consumer'
import {
  ANALYZE_WORKER,
  AnalyzeWorker,
  CONSUMER_CONNECTOR,
  ConsumerConnector,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER,
  PRODUCER_CONNECTOR,
  ProducerConnector,
  Storage,
  STORAGE,
} from '@famir/domain'

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
 * - {@link Storage} via {@link STORAGE} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 * - {@link ConsumerConnector} via {@link CONSUMER_CONNECTOR} token
 * - {@link ConsumerRouter} via {@link CONSUMER_ROUTER} token
 * - {@link AnalyzeWorker} via {@link ANALYZE_WORKER} token
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
          c.resolve<Storage>(STORAGE),
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
   * @param storage - The storage instance.
   * @param producerConnector - The producer connector instance.
   * @param consumerConnector - The consumer connector instance.
   * @param router - The consumer router instance.
   * @param analyzeWorker - The analyze worker instance.
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly storage: Storage,
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

      await this.storage.checkBucketExists()

      await this.producerConnector.connect()

      await this.analyzeWorker.run()

      this.logger.info(`Application started`)
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

      this.logger.info(`Application stopped`)
    } catch (error) {
      this.logger.error(`Application stop failed`, {
        error: serializeError(error),
      })

      throw error
    }
  }
}
