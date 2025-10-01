import { SHUTDOWN_SIGNALS } from '@famir/common'
import {
  AnalyzeLogQueue,
  DatabaseConnector,
  Logger,
  ReplServer,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { internalSchemas } from './console.utils.js'

export class ConsoleApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
    protected readonly replServer: ReplServer
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

      await this.workflowConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`Console stop failed`, { error })

      process.exit(1)
    }
  }
}
