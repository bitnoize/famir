import { BootstrapError, DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Redis } from 'ioredis'
import { PRODUCER_CONNECTOR, ProducerConnector } from './producer-connector.js'
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
 * import {
 *   PRODUCER_CONNECTOR,
 *   ProducerConnector,
 *   RedisProducerConnector,
 *   RedisProducerConnection,
 * } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisProducerConnector.register(container)
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

    const configData = this.config.get<BullProducerConfig>('producer-config')
    this.options = this.buildOptions(configData)

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
      throw BootstrapError.wrap(error, {
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
      throw BootstrapError.wrap(error, {
        service: 'producer-connector',
        method: 'close',
      })
    }
  }

  /**
   * Converts validated configuration to a connector options.
   */
  private buildOptions(data: BullProducerConfig): BullProducerConnectorOptions {
    return {
      connectionUrl: data.PRODUCER_CONNECTION_URL,
    }
  }
}
