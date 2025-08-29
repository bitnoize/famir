import { DatabaseConnector } from '@famir/database'
import { HttpServer } from '@famir/http-server'
import { Logger } from '@famir/logger'
import { TaskQueueConnector } from '@famir/task-queue'
import { Validator } from '@famir/validator'
import { reverseProxySchemas } from './reverse-proxy.schemas.js'

const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const

export class ReverseProxyApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly taskQueueConnector: TaskQueueConnector,
    protected readonly httpServer: HttpServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, () => this.stop())
    })

    validator.addSchemas(reverseProxySchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      //await this.taskQueueConnector.connect()

      await this.httpServer.start()
    } catch (error) {
      console.error(`ReverseProxy start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.httpServer.stop()

      await this.taskQueueConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`ReverseProxy stop failed`, { error })

      process.exit(1)
    }
  }
}
