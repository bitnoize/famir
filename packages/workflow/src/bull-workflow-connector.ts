import { filterSecrets, serializeError } from '@famir/common'
import { Config, Logger, Validator, WorkflowConnector } from '@famir/domain'
import { Redis } from 'ioredis'
import { WorkflowConfig, WorkflowConnectorOptions } from './workflow.js'
import { workflowSchemas } from './workflow.schemas.js'
import { buildConnectorOptions } from './workflow.utils.js'

export type BullWorkflowConnection = Redis

export class BullWorkflowConnector implements WorkflowConnector {
  protected readonly options: WorkflowConnectorOptions
  private readonly _redis: BullWorkflowConnection

  constructor(
    validator: Validator,
    config: Config<WorkflowConfig>,
    protected readonly logger: Logger
  ) {
    validator.addSchemas(workflowSchemas)

    this.options = buildConnectorOptions(config.data)

    this._redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'workflow'
    })

    this._redis.on('error', (error) => {
      this.logger.error(
        {
          error: serializeError(error)
        },
        `Redis error event`
      )
    })

    this.logger.info(
      {
        options: filterSecrets(this.options, ['connectionUrl'])
      },
      `BullWorkflowConnector initialized`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this._redis as T
  }

  //async connect(): Promise<void> {
  //  await this._redis.connect()
  //
  //  this.logger.info({}, `WorkflowConnector connected`)
  //}

  async close(): Promise<void> {
    await this._redis.quit()

    this.logger.info({}, `BullWorkflowConnector closed`)
  }
}
