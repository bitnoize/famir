import { DIContainer, serializeError, SHUTDOWN_SIGNALS } from '@famir/common'
import { DATABASE_CONNECTOR, DatabaseConnector } from '@famir/database'
import {
  ANALYZE_LOG_WORKER,
  AnalyzeLogWorker,
  EXECUTOR_CONNECTOR,
  ExecutorConnector
} from '@famir/executor'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { analyzeLogJobDataSchema, WORKFLOW_CONNECTOR, WorkflowConnector } from '@famir/workflow'

export const APP = Symbol('App')

export class App {
  static inject(container: DIContainer) {
    container.registerSingleton(
      APP,
      (c) =>
        new App(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR),
          c.resolve<WorkflowConnector>(WORKFLOW_CONNECTOR),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR),
          c.resolve<AnalyzeLogWorker>(ANALYZE_LOG_WORKER)
        )
    )
  }

  static resolve(container: DIContainer): App {
    return container.resolve(APP)
  }

  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly databaseConnector: DatabaseConnector,
    protected readonly workflowConnector: WorkflowConnector,
    protected readonly executorConnector: ExecutorConnector,
    protected readonly analyzeLogWorker: AnalyzeLogWorker
  ) {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.once(signal, () => {
        this.stop().catch((error: unknown) => {
          this.logger.error(`App critical error`, {
            error: serializeError(error)
          })

          process.exit(2)
        })
      })
    })

    this.validator.addSchemas({
      'analyze-log-job-data': analyzeLogJobDataSchema
    })

    this.logger.debug(`App initialized`)
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
