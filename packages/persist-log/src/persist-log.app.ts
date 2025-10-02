import { SHUTDOWN_SIGNALS } from '@famir/common'
import {
  AnalyzeLogQueue,
  DatabaseConnector,
  ExecutorConnector,
  Logger,
  PersistLogWorker,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './persist-log.utils.js'

export class PersistLogApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
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

      await this.analyzeLogQueue.close()
      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`PersistLog stop failed`, { error })

      process.exit(1)
    }
  }
}
