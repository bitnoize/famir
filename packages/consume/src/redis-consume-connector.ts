import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Redis } from 'ioredis'
import {
  BullConsumeConfig,
  CONSUME_CONNECTOR,
  ConsumeConnector,
  RedisConsumeConnection,
  RedisConsumeConnectorOptions
} from './consume.js'

export class RedisConsumeConnector implements ConsumeConnector {
  static inject(container: DIContainer) {
    container.registerSingleton<ConsumeConnector>(
      CONSUME_CONNECTOR,
      (c) =>
        new RedisConsumeConnector(
          c.resolve<Config<BullConsumeConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: RedisConsumeConnectorOptions
  private readonly redis: RedisConsumeConnection

  constructor(
    config: Config<BullConsumeConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'consume',
      maxRetriesPerRequest: null
    })

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error)
      })
    })

    this.logger.debug(`ConsumeConnector initialized`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T {
    return this.redis as T
  }

  //async connect(): Promise<void> {
  //  await this.redis.connect()
  //
  //  this.logger.debug(`ConsumeConnector connected`)
  //}

  async close(): Promise<void> {
    await this.redis.quit()

    this.logger.debug(`ConsumeConnector closed`)
  }

  private buildOptions(config: BullConsumeConfig): RedisConsumeConnectorOptions {
    return {
      connectionUrl: config.CONSUME_CONNECTION_URL
    }
  }
}
