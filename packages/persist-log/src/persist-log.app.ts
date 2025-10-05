import { DIContainer, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  Logger,
  LOGGER,
  PERSIST_LOG_WORKER,
  PersistLogWorker,
  Validator,
  VALIDATOR,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { addSchemas } from './persist-log.utils.js'

export const PERSIST_LOG_APP = Symbol('PersistLogApp')

export class PersistLogApp {
  static inject(container: DIContainer) {
    container.registerSingleton<PersistLogApp>(
      PERSIST_LOG_APP,
      (c) =>
        new PersistLogApp(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR),
          c.resolve<PersistLogWorker>(PERSIST_LOG_WORKER)
        )
    )
  }

  static resolve(container: DIContainer): PersistLogApp {
    return container.resolve<PersistLogApp>(PERSIST_LOG_APP)
  }

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly executorConnector: ExecutorConnector,
    protected readonly persistLogWorker: PersistLogWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(addSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.persistLogWorker.run()
    } catch (error) {
      console.error(`PersistLog start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.persistLogWorker.close()
      await this.executorConnector.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`PersistLog stop failed`, { error })

      process.exit(1)
    }
  }
}
