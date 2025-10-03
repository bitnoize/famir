import { DIContainer, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  HTTP_SERVER,
  HttpServer,
  Logger,
  LOGGER,
  PERSIST_LOG_QUEUE,
  PersistLogQueue,
  Validator,
  VALIDATOR,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './reverse-proxy.utils.js'

export const REVERSE_PROXY_APP = Symbol('ReverseProxyApp')

export class ReverseProxyApp {
  static inject(container: DIContainer) {
    container.registerSingleton<ReverseProxyApp>(
      REVERSE_PROXY_APP,
      (c) =>
        new ReverseProxyApp(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<PersistLogQueue>(PERSIST_LOG_QUEUE),
          c.resolve<HttpServer>(HTTP_SERVER)
        )
    )
  }

  static resolve(container: DIContainer): ReverseProxyApp {
    return container.resolve<ReverseProxyApp>(REVERSE_PROXY_APP)
  }

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly persistLogQueue: PersistLogQueue,
    protected readonly httpServer: HttpServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(internalSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.httpServer.listen()
    } catch (error) {
      console.error(`ReverseProxy start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.httpServer.close()

      await this.persistLogQueue.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`ReverseProxy stop failed`, { error })

      process.exit(1)
    }
  }
}
