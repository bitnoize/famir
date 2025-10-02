import { DIContainer, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  DatabaseConnector,
  ExecutorConnector,
  Logger,
  PersistLogWorker,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './persist-log.utils.js'

export class PersistLogApp {
  static inject(container: DIContainer): PersistLogApp {
    container.registerSingleton<PersistLogApp>(
      'PersistLogApp',
      (c) =>
        new PersistLogApp(
          c.resolve<Validator>('Validator'),
          c.resolve<Logger>('Logger'),
          c.resolve<DatabaseConnector>('DatabaseConnector'),
          c.resolve<WorkflowConnector>('WorkflowConnector'),
          c.resolve<ExecutorConnector>('ExecutorConnector'),
          c.resolve<PersistLogWorker>('PersistLogWorker')
        )
    )

    return container.resolve<PersistLogApp>('PersistLogApp')
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

    validator.addSchemas(internalSchemas)
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
