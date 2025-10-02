import { DIContainer, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  DatabaseConnector,
  HttpServer,
  Logger,
  PersistLogQueue,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './reverse-proxy.utils.js'

export class ReverseProxyApp {
  static inject(container: DIContainer): ReverseProxyApp {
    container.registerSingleton<ReverseProxyApp>(
      'ReverseProxyApp',
      (c) =>
        new ReverseProxyApp(
          c.resolve<Validator>('Validator'),
          c.resolve<Logger>('Logger'),
          c.resolve<DatabaseConnector>('DatabaseConnector'),
          c.resolve<WorkflowConnector>('WorkflowConnector'),
          c.resolve<PersistLogQueue>('PersistLogQueue'),
          c.resolve<HttpServer>('HttpServer')
        )
    )

    return container.resolve<ReverseProxyApp>('ReverseProxyApp')
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
