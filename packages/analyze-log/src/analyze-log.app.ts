import { SHUTDOWN_SIGNALS } from '@famir/common'
import {
  AnalyzeLogWorker,
  DatabaseConnector,
  ExecutorConnector,
  Logger,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './analyze-log.utils.js'

export class AnalyzeLogApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly executorConnector: ExecutorConnector,
    protected readonly analyzeLogWorker: AnalyzeLogWorker
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

      await this.analyzeLogWorker.run()
    } catch (error) {
      console.error(`AnalyzeLog start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.analyzeLogWorker.close()

      await this.executorConnector.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`AnalyzeLog stop failed`, { error })

      process.exit(1)
    }
  }
}
