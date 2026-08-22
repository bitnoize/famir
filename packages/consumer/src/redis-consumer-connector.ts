import { BootstrapError, DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Redis } from 'ioredis'
import { CONSUMER_CONNECTOR, ConsumerConnector } from './consumer-connector.js'
import { BullConsumerConfig, RedisConsumerConnection } from './consumer.js'
import { bullConsumerConfigSchema } from './consumer.schemas.js'

/**
 * Options for a Bull consumer connector.
 *
 * @category none
 */
interface BullConsumerConnectorOptions {
  connectionUrl: string
}

/**
 * Redis-based consumer connector implementation.
 *
 * Uses the ioredis client to manage connections for the Bull queue consumer.
 *
 * @see https://github.com/redis/ioredis - ioredis documentation
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import {
 *   CONSUMER_CONNECTOR,
 *   ConsumerConnector,
 *   RedisConsumerConnector,
 *   RedisConsumerConnection,
 * } from '@famir/consumer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisConsumerConnector.register(container)
 *
 * // Resolve dependency from container
 * const connector = container.resolve<ConsumerConnector>(CONSUMER_CONNECTOR)
 *
 * // Get underlying Redis connection
 * const connection = connector.getConnection<RedisConsumerConnection>()
 *
 * //  Close connection
 * await connector.close()
 * ```
 *
 * @category none
 */
export class RedisConsumerConnector implements ConsumerConnector {
  /**
   * Registers the connector as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ConsumerConnector>(
      CONSUMER_CONNECTOR,
      (c) =>
        new RedisConsumerConnector(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /** Built connector options. */
  protected readonly options: BullConsumerConnectorOptions

  /** Underlying Redis connection instance. */
  private readonly connection: RedisConsumerConnection

  /**
   * Creates a new connector instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger
  ) {
    this.validator.addSchema('consumer-config', bullConsumerConfigSchema)

    const conf = this.config.get<BullConsumerConfig>('consumer-config')
    this.options = this.buildOptions(conf)

    this.connection = new Redis(this.options.connectionUrl, {
      connectionName: 'consumer',
      maxRetriesPerRequest: null,
    })

    this.connection.on('error', (error) => {
      this.logger.error(`ConsumerConnector Redis event: error`, {
        error: serializeError(error),
      })
    })

    this.connection.on('ready', () => {
      this.logger.debug(`ConsumerConnector Redis event: ready`)
    })

    this.connection.on('end', () => {
      this.logger.debug(`ConsumerConnector Redis event: end`)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  async connect(): Promise<void> {
    try {
      await this.connection.ping()

      this.logger.info(`ConsumerConnector established connection`)
    } catch (error) {
      throw BootstrapError.wrap(error, {
        service: 'consumer-connector',
        method: 'connect',
      })
    }
  }

  async close(): Promise<void> {
    try {
      await this.connection.quit()

      this.logger.info(`ConsumerConnector closed connection`)
    } catch (error) {
      throw BootstrapError.wrap(error, {
        service: 'consumer-connector',
        method: 'close',
      })
    }
  }

  /**
   * Converts validated configuration to a connector options.
   */
  private buildOptions(conf: BullConsumerConfig): BullConsumerConnectorOptions {
    return {
      connectionUrl: conf.CONSUMER_CONNECTION_URL,
    }
  }
}
