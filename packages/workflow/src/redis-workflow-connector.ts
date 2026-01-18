import { DIContainer, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  WORKFLOW_CONNECTOR,
  WorkflowConnector
} from '@famir/domain'
import { Redis } from 'ioredis'
import { BullWorkflowConfig, RedisWorkflowConnectorOptions } from './workflow.js'

export type RedisWorkflowConnection = Redis

export class RedisWorkflowConnector implements WorkflowConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<WorkflowConnector>(
      WORKFLOW_CONNECTOR,
      (c) =>
        new RedisWorkflowConnector(
          c.resolve<Config<BullWorkflowConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: RedisWorkflowConnectorOptions
  protected readonly redis: RedisWorkflowConnection

  constructor(
    config: Config<BullWorkflowConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'workflow'
    })

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`WorkflowConnector initialized`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this.redis as T
  }

  //async connect(): Promise<void> {
  //  await this.redis.connect()
  //
  //  this.logger.debug(`Workflow connected`)
  //}

  async close(): Promise<void> {
    await this.redis.quit()

    this.logger.debug(`Workflow closed`)
  }

  private buildOptions(config: BullWorkflowConfig): RedisWorkflowConnectorOptions {
    return {
      connectionUrl: config.WORKFLOW_CONNECTION_URL
    }
  }
}
