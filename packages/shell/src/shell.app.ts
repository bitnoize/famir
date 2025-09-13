import { SHUTDOWN_SIGNALS } from '@famir/common'
import { DatabaseConnector } from '@famir/database'
import { Logger } from '@famir/logger'
import { ReplServer } from '@famir/repl-server'
import {
  HeartbeatQueue,
  ScanMessageQueue,
  ScanSessionQueue,
  TaskQueueConnector
} from '@famir/task-queue'
import { Validator } from '@famir/validator'
import { shellSchemas } from './shell.schemas.js'

export class ShellApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly taskQueueConnector: TaskQueueConnector,
    protected readonly heartbeatQueue: HeartbeatQueue,
    protected readonly scanSessionQueue: ScanSessionQueue,
    protected readonly scanMessageQueue: ScanMessageQueue,
    protected readonly replServer: ReplServer
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(shellSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      //await this.taskQueueConnector.connect()

      await this.replServer.listen()
    } catch (error) {
      console.error(`Shell start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.replServer.close()

      await this.taskQueueConnector.close()

      await this.heartbeatQueue.close()
      await this.scanSessionQueue.close()
      await this.scanMessageQueue.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`Shell stop failed`, { error })

      process.exit(1)
    }
  }
}
