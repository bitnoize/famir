import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { HTTP_SERVER, HTTP_SERVER_ROUTER, HttpServer, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE, AnalyzeQueue, PRODUCE_CONNECTOR, ProduceConnector } from '@famir/produce'
import { REVERSE_APP } from './reverse.js'

/*
 * Reverse app
 */
export class ReverseApp {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton(
      REVERSE_APP,
      (c) =>
        new ReverseApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<ProduceConnector>(PRODUCE_CONNECTOR),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER),
          c.resolve<HttpServer>(HTTP_SERVER)
        )
    )
  }

  /*
   * Resolve dependency
   */
  static resolve(container: DIContainer): ReverseApp {
    return container.resolve(REVERSE_APP)
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly produceConnector: ProduceConnector,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly router: HttpServerRouter,
    protected readonly httpServer: HttpServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.once(signal, () => {
        this.stop().catch((error: unknown) => {
          this.logger.error(`App critical error`, {
            error: serializeError(error)
          })

          process.exit(2)
        })
      })
    })

    this.logger.debug(`App initialized`)
  }

  /*
   * Start app
   */
  async start(): Promise<void> {
    try {
      this.router.activate()

      await this.databaseConnector.connect()

      await this.httpServer.start()

      this.logger.debug(`App started`)
    } catch (error) {
      this.logger.error(`App start failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }

  /*
   * Stop app
   */
  async stop(): Promise<void> {
    try {
      await this.httpServer.stop()

      await this.analyzeQueue.close()

      await this.produceConnector.close()

      await this.databaseConnector.close()

      this.logger.debug(`App stopped`)
    } catch (error) {
      this.logger.error(`App stop failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }
}
