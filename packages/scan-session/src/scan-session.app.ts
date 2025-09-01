import { SHUTDOWN_SIGNALS } from '@famir/common'
import { DatabaseConnector } from '@famir/database'
import { Logger } from '@famir/logger'
import { ScanSessionWorker, TaskWorkerConnector } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { scanSessionSchemas } from './scan-session.schemas.js'

export class ScanSessionApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly taskWorkerConnector: TaskWorkerConnector,
    protected readonly scanSessionWorker: ScanSessionWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(scanSessionSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.scanSessionWorker.run()
    } catch (error) {
      console.error(`ScanSession start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.scanSessionWorker.close()

      await this.taskWorkerConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`ScanSession stop failed`, { error })

      process.exit(1)
    }
  }
}
