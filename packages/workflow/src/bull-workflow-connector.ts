import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { Redis } from 'ioredis'
import { WorkflowConfig, WorkflowConnectorOptions } from './workflow.js'
import { buildConnectorOptions } from './workflow.utils.js'

export type BullWorkflowConnection = Redis

export class BullWorkflowConnector implements WorkflowConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<WorkflowConnector>(
      WORKFLOW_CONNECTOR,
      (c) =>
        new BullWorkflowConnector(
          c.resolve<Config<WorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: WorkflowConnectorOptions
  private readonly _redis: BullWorkflowConnection

  constructor(
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger
  ) {
    this.options = buildConnectorOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'workflow'
    })

    this._redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`WorkflowConnector initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  //async connect(): Promise<void> {
  //  await this._redis.connect()
  //
  //  this.logger.debug(`WorkflowConnector connected`)
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.debug(`WorkflowConnector closed`)
  }
}
