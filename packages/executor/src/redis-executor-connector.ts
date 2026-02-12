import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Redis } from 'ioredis'
import {
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  RedisExecutorConnection
} from './executor-connector.js'
import { BullExecutorConfig, RedisExecutorConnectorOptions } from './executor.js'

export class RedisExecutorConnector implements ExecutorConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<ExecutorConnector>(
      EXECUTOR_CONNECTOR,
      (c) =>
        new RedisExecutorConnector(
          c.resolve<Config<BullExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: RedisExecutorConnectorOptions
  private readonly redis: RedisExecutorConnection

  constructor(
    config: Config<BullExecutorConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

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
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this.redis as T
  }

  //async connect(): Promise<void> {
  //  await this.redis.connect()
  //
  //  this.logger.debug(`Executor connected`)
  //}

  async close(): Promise<void> {
    await this.redis.quit()

    this.logger.debug(`Executor closed`)
  }

  private buildOptions(config: BullExecutorConfig): RedisExecutorConnectorOptions {
    return {
      connectionUrl: config.EXECUTOR_CONNECTION_URL
    }
  }
}
