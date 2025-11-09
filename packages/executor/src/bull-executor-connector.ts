import { DIContainer, isDevelopment, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  Logger,
  LOGGER
} from '@famir/domain'
import { Redis } from 'ioredis'
import { ExecutorConfig, ExecutorConnectorOptions } from './executor.js'
import { buildConnectorOptions } from './executor.utils.js'

export type BullExecutorConnection = Redis

export class BullExecutorConnector implements ExecutorConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<ExecutorConnector>(
      EXECUTOR_CONNECTOR,
      (c) =>
        new BullExecutorConnector(
          c.resolve<Config<ExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: ExecutorConnectorOptions
  private readonly redis: BullExecutorConnection

  constructor(
    config: Config<ExecutorConfig>,
    protected readonly logger: Logger
  ) {
    this.options = buildConnectorOptions(config.data)

    this.redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'executor',
      maxRetriesPerRequest: null
    })

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`ExecutorConnector initialized`, {
      options: isDevelopment ? this.options : null
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this.redis as T
  }

  //async connect(): Promise<void> {
  //  await this.redis.connect()
  //
  //  this.logger.debug(`ExecutorConnector connected`)
  //}

  async close(): Promise<void> {
    await this.redis.quit()

    this.logger.debug(`ExecutorConnector closed`)
  }
}
