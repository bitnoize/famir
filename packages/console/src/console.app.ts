import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER, ReplServer } from '@famir/repl-server'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/workflow'

export const APP = Symbol('App')

export class App {
  static inject(container: DIContainer) {
    container.registerSingleton(
      APP,
      (c) =>
        new App(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE),
          c.resolve<ReplServer>(REPL_SERVER)
        )
    )
  }

  static resolve(container: DIContainer): App {
    return container.resolve(APP)
  }

  constructor(
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
    protected readonly replServer: ReplServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.once(signal, () => {
        this.stop().catch((error: unknown) => {
          this.logger.fatal(`App stop unhandled error`, {
            error: serializeError(error)
          })

          process.exit(2)
        })
      })
    })

    this.logger.debug(`App initialized`)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.replServer.start()

      this.logger.debug(`App started`)
    } catch (error) {
      this.logger.error(`App start failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.replServer.stop()

      await this.analyzeLogQueue.close()

      await this.workflowConnector.close()

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
