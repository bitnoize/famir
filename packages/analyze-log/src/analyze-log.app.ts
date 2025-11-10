import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import {
  ANALYZE_LOG_WORKER,
  AnalyzeLogWorker,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { addSchemas } from './analyze-log.utils.js'

export const ANALYZE_LOG_APP = Symbol('AnalyzeLogApp')

export class AnalyzeLogApp {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeLogApp>(
      ANALYZE_LOG_APP,
      (c) =>
        new AnalyzeLogApp(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR),
          c.resolve<AnalyzeLogWorker>(ANALYZE_LOG_WORKER)
        )
    )
  }

  static resolve(container: DIContainer): AnalyzeLogApp {
    return container.resolve<AnalyzeLogApp>(ANALYZE_LOG_APP)
  }

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly executorConnector: ExecutorConnector,
    protected readonly analyzeLogWorker: AnalyzeLogWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.once(signal, () => {
        this.stop().catch((error: unknown) => {
          this.logger.fatal(`App stop unhandled error`, {
            error: serializeError(error)
          })
        })
      })
    })

    validator.addSchemas(addSchemas)

    this.logger.debug(`AnalyzeLogApp initialized`)
  }

  async start(): Promise<void> {
    try {
      await this.databaseConnector.connect()

      await this.analyzeLogWorker.run()

      this.logger.debug(`App started`)
    } catch (error) {
      this.logger.error(`App start failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }

  protected async stop(): Promise<void> {
    try {
      await this.analyzeLogWorker.close()

      await this.executorConnector.close()

      await this.workflowConnector.close()

      await this.databaseConnector.close()

      this.logger.debug(`App stopped`)
    } catch (error) {
      this.logger.error(`App stop failed`, {
        error: serializeError(error)
      })

      process.exit(1)
    }
  }
}
