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

    const configData = this.config.get<BullConsumerConfig>('consumer-config')
    this.options = this.buildOptions(configData)

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
      this.logger.info(`ConsumerConnector Redis event: ready`)
    })

    this.connection.on('end', () => {
      this.logger.info(`ConsumerConnector Redis event: end`)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  async close(): Promise<void> {
    try {
      await this.connection.quit()

      this.logger.debug(`ConsumerConnector closed connection`)
    } catch (error) {
      this.handleBootstrapError(error, 'close')
    }
  }

  /**
   * Handles bootstrap operation errors.
   *
   * Re-throws `BootstrapError` instances with additional context, or wraps
   * unknown errors into a `BootstrapError`.
   *
   * @param error - The caught error.
   * @param method - The name of the method where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleBootstrapError(error: unknown, method: string): never {
    if (error instanceof BootstrapError) {
      error.context['service'] = 'consumer-connector'
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'consumer-connector',
          method,
        },
      })
    }
  }

  /**
   * Converts validated configuration to a connector options.
   *
   * @param data - The validated configuration object.
   * @returns The connector options object.
   */
  private buildOptions(data: BullConsumerConfig): BullConsumerConnectorOptions {
    return {
      connectionUrl: data.CONSUMER_CONNECTION_URL,
    }
  }
}
