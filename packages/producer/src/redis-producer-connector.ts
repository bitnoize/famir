import { DIContainer, LifecycleError, serializeError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  PRODUCER_CONNECTOR,
  ProducerConnector,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { Redis } from 'ioredis'
import { BullProducerConfig, RedisProducerConnection } from './producer.js'
import { bullProducerConfigSchema } from './producer.schemas.js'

/**
 * Options for a Bull producer connector.
 *
 * @category none
 */
interface BullProducerConnectorOptions {
  connectionUrl: string
}

/**
 * Redis-based producer connector implementation.
 *
 * Uses the ioredis client to manage connections for the Bull queue producer.
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
 * import { RedisProducerConnector } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisProducerConnector.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { PRODUCER_CONNECTOR, ProducerConnector } from '@famir/domain'
 * import { RedisProducerConnection } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve dependency from container
 * const connector = container.resolve<ProducerConnector>(PRODUCER_CONNECTOR)
 *
 * // Get underlying Redis connection
 * const connection = connector.getConnection<RedisProducerConnection>()
 *
 * //  Close connection
 * await connector.close()
 * ```
 *
 * @category none
 */
export class RedisProducerConnector implements ProducerConnector {
  /**
   * Registers the connector as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ProducerConnector>(
      PRODUCER_CONNECTOR,
      (c) =>
        new RedisProducerConnector(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /** Built connector options. */
  protected readonly options: BullProducerConnectorOptions

  /** Underlying Redis connection instance. */
  protected readonly connection: RedisProducerConnection

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
    this.validator.addSchema('producer-config', bullProducerConfigSchema)

    const conf = this.config.get<BullProducerConfig>('producer-config')
    this.options = this.buildOptions(conf)

    this.connection = new Redis(this.options.connectionUrl, {
      connectionName: 'producer',
      maxRetriesPerRequest: 10,
    })

    this.connection.on('error', (error) => {
      this.logger.error(`ProducerConnector Redis event: error`, {
        error: serializeError(error),
      })
    })

    this.connection.on('ready', () => {
      this.logger.debug(`ProducerConnector Redis event: ready`)
    })

    this.connection.on('end', () => {
      this.logger.debug(`ProducerConnector Redis event: end`)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  async connect(): Promise<void> {
    try {
      await this.connection.ping()

      this.logger.info(`ProducerConnector established connection`)
    } catch (error) {
      throw LifecycleError.wrap(error, {
        service: 'producer-connector',
        method: 'connect',
      })
    }
  }

  async close(): Promise<void> {
    try {
      await this.connection.quit()

      this.logger.info(`ProducerConnector closed connection`)
    } catch (error) {
      throw LifecycleError.wrap(error, {
        service: 'producer-connector',
        method: 'close',
      })
    }
  }

  /**
   * Converts validated configuration to a connector options.
   */
  private buildOptions(conf: BullProducerConfig): BullProducerConnectorOptions {
    return {
      connectionUrl: conf.PRODUCER_CONNECTION_URL,
    }
  }
}
