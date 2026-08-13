import { DIContainer, serializeError } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE, AnalyzeQueue, PRODUCER_CONNECTOR, ProducerConnector } from '@famir/producer'
import { REPL_SERVER, REPL_SERVER_ROUTER, ReplServer, ReplServerRouter } from '@famir/repl-server'
import { Storage, STORAGE } from '@famir/storage'

/**
 * DI token for the console application.
 *
 * @category none
 */
export const CONSOLE_APP = Symbol('ConsoleApp')

/**
 * Represents the console application.
 *
 * Depends:
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 * - {@link Storage} via {@link STORAGE} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 * - {@link AnalyzeQueue} via {@link ANALYZE_QUEUE} token
 * - {@link ReplServerRouter} via {@link REPL_SERVER_ROUTER} token
 * - {@link ReplServer} via {@link REPL_SERVER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { ConsoleApp } from '@famir/console-app'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register all dependencies
 * // ...
 *
 * // Resolve and start the application
 * const app = ConsoleApp.resolve(container)
 * await app.start()
 * ```
 *
 * @category none
 */
export class ConsoleApp {
  /**
   * Registers the application as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ConsoleApp>(
      CONSOLE_APP,
      (c) =>
        new ConsoleApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<Storage>(STORAGE),
          c.resolve<ProducerConnector>(PRODUCER_CONNECTOR),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<ReplServer>(REPL_SERVER)
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
    return container.resolve<ConsoleApp>(CONSOLE_APP)
  }

  /**
   * Creates a new application instance.
   *
   * @param logger - The logger instance.
   * @param databaseConnector - The database connector instance.
   * @param storage - The storage instance.
   * @param producerConnector - The producer connector instance.
   * @param analyzeQueue - The analyze queue instance.
   * @param router - The repl-server router instance.
   * @param replServer - The repl-server instance.
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly storage: Storage,
    protected readonly producerConnector: ProducerConnector,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly router: ReplServerRouter,
    protected readonly replServer: ReplServer
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

      await this.replServer.start()

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
      await this.replServer.stop()

      await this.analyzeQueue.close()

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
