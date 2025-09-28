import { SHUTDOWN_SIGNALS } from '@famir/common'
import {
  DatabaseConnector,
  Logger,
  ScanMessageWorker,
  ExecutorConnector,
  Validator
} from '@famir/domain'
import { scanMessageSchemas } from './scan-message.schemas.js'

export class ScanMessageApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly executorConnector: ExecutorConnector,
    protected readonly scanMessageWorker: ScanMessageWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(scanMessageSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.scanMessageWorker.run()
    } catch (error) {
      console.error(`ScanMessage start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.scanMessageWorker.close()

      await this.executorConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`ScanMessage stop failed`, { error })

      process.exit(1)
    }
  }
}
