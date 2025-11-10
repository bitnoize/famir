import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER,
  REPL_SERVER,
  ReplServer,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'

export const CONSOLE_APP = Symbol('ConsoleApp')

export class ConsoleApp {
  static inject(container: DIContainer) {
    container.registerSingleton<ConsoleApp>(
      CONSOLE_APP,
      (c) =>
        new ConsoleApp(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE),
          c.resolve<ReplServer>(REPL_SERVER)
        )
    )
  }

  static resolve(container: DIContainer): ConsoleApp {
    return container.resolve<ConsoleApp>(CONSOLE_APP)
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
        })
      })
    })

    this.logger.debug(`ConsoleApp initialized`)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.replServer.listen()

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
      await this.replServer.close()

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
