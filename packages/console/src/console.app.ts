import { DIContainer, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  Logger,
  LOGGER,
  PERSIST_LOG_QUEUE,
  PersistLogQueue,
  REPL_SERVER,
  ReplServer,
  Validator,
  VALIDATOR,
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
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE),
          c.resolve<PersistLogQueue>(PERSIST_LOG_QUEUE),
          c.resolve<ReplServer>(REPL_SERVER)
        )
    )
  }

  static resolve(container: DIContainer): ConsoleApp {
    return container.resolve<ConsoleApp>(CONSOLE_APP)
  }

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
    protected readonly persistLogQueue: PersistLogQueue,
    protected readonly replServer: ReplServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.replServer.listen()
    } catch (error) {
      console.error(`Console start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.replServer.close()

      await this.analyzeLogQueue.close()
      await this.persistLogQueue.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`Console stop failed`, { error })

      process.exit(1)
    }
  }
}
