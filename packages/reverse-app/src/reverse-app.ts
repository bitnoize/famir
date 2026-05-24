import { DIContainer, serializeError } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { HTTP_SERVER, HTTP_SERVER_ROUTER, HttpServer, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE, AnalyzeQueue, PRODUCER_CONNECTOR, ProducerConnector } from '@famir/producer'

/**
 * DI token for the reverse application.
 *
 * @category none
 */
export const REVERSE_APP = Symbol('ReverseApp')

/**
 * Represents the reverse application.
 *
 * Depends:
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 * - {@link AnalyzeQueue} via {@link ANALYZE_QUEUE} token
 * - {@link HttpServerRouter} via {@link HTTP_SERVER_ROUTER} token
 * - {@link HttpServer} via {@link HTTP_SERVER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { ReverseApp } from '@famir/reverse-app'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register all dependencies
 * // ...
 *
 * // Resolve and start the application
 * const app = ReverseApp.resolve(container)
 * await app.start()
 * ```
 *
 * @category none
 */
export class ReverseApp {
  /**
   * Registers the application as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReverseApp>(
      REVERSE_APP,
      (c) =>
        new ReverseApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<ProducerConnector>(PRODUCER_CONNECTOR),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<HttpServer>(HTTP_SERVER)
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
    return container.resolve<ReverseApp>(REVERSE_APP)
  }

  /**
   * Creates a new application instance.
   *
   * @param logger - The logger instance.
   * @param databaseConnector - The database connector instance.
   * @param producerConnector - The producer connector instance.
   * @param analyzeQueue - The analyze queue instance.
   * @param router - The http-server router instance.
   * @param httpServer - The http-server instance.
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly producerConnector: ProducerConnector,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly router: HttpServerRouter,
    protected readonly httpServer: HttpServer
  ) {}

  /**
   * Starts the application.
   */
  async start(): Promise<void> {
    try {
      this.router.activate()

      await this.databaseConnector.connect()

      await this.httpServer.start()

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
      await this.httpServer.stop()

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
