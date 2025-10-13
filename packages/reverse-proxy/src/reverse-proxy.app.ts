import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  HTTP_SERVER,
  HttpServer,
  Logger,
  LOGGER,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'

export const REVERSE_PROXY_APP = Symbol('ReverseProxyApp')

export class ReverseProxyApp {
  static inject(container: DIContainer) {
    container.registerSingleton<ReverseProxyApp>(
      REVERSE_PROXY_APP,
      (c) =>
        new ReverseProxyApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE),
          c.resolve<HttpServer>(HTTP_SERVER)
        )
    )
  }

  static resolve(container: DIContainer): ReverseProxyApp {
    return container.resolve<ReverseProxyApp>(REVERSE_PROXY_APP)
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
    protected readonly httpServer: HttpServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    this.logger.debug(`ReverseProxyApp initialized`)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.httpServer.listen()

      this.logger.debug(`ReverseProxyApp started`)
    } catch (error) {
      this.logger.error(`ReverseProxyApp start failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.httpServer.close()

      await this.analyzeLogQueue.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()

      this.logger.debug(`ReverseProxyApp stopped`)
    } catch (error) {
      this.logger.error(`ReverseProxyApp stop failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }
}
