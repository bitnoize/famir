import { serializeError } from '@famir/common'
import { Config, Logger, Validator, WorkflowConnector } from '@famir/domain'
import { Redis } from 'ioredis'
import { WorkflowConfig, WorkflowConnectorOptions } from './workflow.js'
import { buildConnectorOptions, filterOptionsSecrets, internalSchemas } from './workflow.utils.js'

export type BullWorkflowConnection = Redis

export class BullWorkflowConnector implements WorkflowConnector {
  protected readonly options: WorkflowConnectorOptions
  private readonly _redis: BullWorkflowConnection

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(internalSchemas)

    this.options = buildConnectorOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'workflow'
    })

    this._redis.on('error', (error) => {
      this.logger.error(
        {
          module: 'workflow',
          error: serializeError(error)
        },
        `Redis error event`
      )
    })

    this.logger.debug(
      {
        module: 'workflow',
        options: filterOptionsSecrets(this.options)
      },
      `WorkflowConnector initialized`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  //async connect(): Promise<void> {
  //  await this._redis.connect()
  //
  //  this.logger.debug(
  //    {
  //      module: 'workflow'
  //    },
  //    `WorkflowConnector connected`
  //  )
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.debug(
      {
        module: 'workflow'
      },
      `WorkflowConnector closed`
    )
  }
}
