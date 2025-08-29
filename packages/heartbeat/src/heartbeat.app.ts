import { DatabaseConnector } from '@famir/database'
import { Logger } from '@famir/logger'
import { ScanMessageQueue, ScanSessionQueue, TaskQueueConnector } from '@famir/task-queue'
import { HeartbeatWorker, TaskWorkerConnector } from '@famir/task-worker'
import { Validator } from '@famir/validator'
import { heartbeatSchemas } from './heartbeat.schemas.js'

const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const

export class HeartbeatApp {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly taskQueueConnector: TaskQueueConnector,
    protected readonly scanSessionQueue: ScanSessionQueue,
    protected readonly scanMessageQueue: ScanMessageQueue,
    protected readonly taskWorkerConnector: TaskWorkerConnector,
    protected readonly heartbeatWorker: HeartbeatWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, async () => {
        await this.stop()
      })
    })

    validator.addSchemas(heartbeatSchemas)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      //await this.taskQueueConnector.connect()

      //await this.taskWorkerConnector.connect()

      await this.heartbeatWorker.run()
    } catch (error) {
      console.error(`Heartbeat start failed`, { error })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.heartbeatWorker.close()

      await this.taskWorkerConnector.close()

      await this.scanSessionQueue.close()
      await this.scanMessageQueue.close()

      await this.taskQueueConnector.close()

      await this.databaseConnector.close()
    } catch (error) {
      console.error(`Heartbeat stop failed`, { error })

      process.exit(1)
    }
  }
}
