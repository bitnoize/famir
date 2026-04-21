import { DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Redis } from 'ioredis'
import {
  BullProduceConfig,
  PRODUCE_CONNECTOR,
  ProduceConnector,
  RedisProduceConnection,
  RedisProduceConnectorOptions,
} from './produce.js'

/**
 * Redis produce connector implementation
 *
 * @category none
 */
export class RedisProduceConnector implements ProduceConnector {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProduceConnector>(
      PRODUCE_CONNECTOR,
      (c) =>
        new RedisProduceConnector(
          c.resolve<Config<BullProduceConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  protected readonly options: RedisProduceConnectorOptions
  protected readonly redis: RedisProduceConnection

  constructor(
    config: Config<BullProduceConfig>,
    protected readonly logger: Logger
  ) {
    this.options = this.buildOptions(config.data)

    this.redis = new Redis(this.options.connectionUrl, {
      //lazyConnect: true,
      connectionName: 'produce',
    })

    this.redis.on('error', (error) => {
      this.logger.error(`Redis error event`, {
        error: serializeError(error),
      })
    })

    this.logger.debug(`ProduceConnector initialized`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.redis as T
  }

  //async connect(): Promise<void> {
  //  await this.redis.connect()
  //
  //  this.logger.debug(`ProduceConnector connected`)
  //}

  async close(): Promise<void> {
    await this.redis.quit()

    this.logger.debug(`ProduceConnector closed`)
  }

  private buildOptions(config: BullProduceConfig): RedisProduceConnectorOptions {
    return {
      connectionUrl: config.PRODUCE_CONNECTION_URL,
    }
  }
}
