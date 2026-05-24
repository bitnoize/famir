import { BootstrapError, DIContainer, serializeError } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { createClient } from 'redis'
import { DATABASE_CONNECTOR, DatabaseConnector } from './database-connector.js'
import { databaseFunctions } from './database.functions.js'
import { RedisDatabaseConfig, RedisDatabaseConnection } from './database.js'
import {
  redisDatabaseArrayReplySchema,
  redisDatabaseArrayStringsReplySchema,
  redisDatabaseConfigSchema,
  redisDatabaseStringReplySchema,
} from './database.schemas.js'

/**
 * Options for a Redis database connector.
 *
 * @category none
 */
interface RedisDatabaseConnectorOptions {
  connectionUrl: string
}

/**
 * Redis-based database connector implementation.
 *
 * Uses the official Node Redis client with custom Redis Functions.
 *
 * @see https://github.com/redis/node-redis - Node Redis client
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
 *   DATABASE_CONNECTOR,
 *   DatabaseConnector,
 *   RedisDatabaseConnector,
 *   RedisDatabaseConnection,
 * } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisDatabaseConnector.register(container)
 *
 * // Resolve dependency from container
 * const connector = container.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
 *
 * // Connect to Redis
 * await connector.connect()
 *
 * // Get underlying Redis connection
 * const connection = connector.getConnection<RedisDatabaseConnection>()
 *
 * // Execute ping command
 * const result = await connection.PING()
 * console.log(result) // 'PONG'
 *
 * //  Close connection
 * await connector.close()
 * ```
 *
 * @category none
 */
export class RedisDatabaseConnector implements DatabaseConnector {
  /**
   * Registers the connector as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseConnector>(
      DATABASE_CONNECTOR,
      (c) =>
        new RedisDatabaseConnector(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER)
        )
    )
  }

  /** Built connector options. */
  protected readonly options: RedisDatabaseConnectorOptions

  /** Underlying Redis connection instance. */
  protected readonly connection: RedisDatabaseConnection

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
    this.validator
      .addSchema('database-config', redisDatabaseConfigSchema)
      .addSchema('database-string-reply', redisDatabaseStringReplySchema)
      .addSchema('database-array-reply', redisDatabaseArrayReplySchema)
      .addSchema('database-array-strings-reply', redisDatabaseArrayStringsReplySchema)

    const configData = this.config.get<RedisDatabaseConfig>('database-config')
    this.options = this.buildOptions(configData)

    this.connection = createClient({
      url: this.options.connectionUrl,
      functions: databaseFunctions,
      name: 'database',
    })

    this.connection.on('error', (error) => {
      this.logger.error(`DatabaseConnector Redis event: error`, {
        error: serializeError(error),
      })
    })

    this.connection.on('ready', () => {
      this.logger.info(`DatabaseConnector Redis event: ready`)
    })

    this.connection.on('end', () => {
      this.logger.info(`DatabaseConnector Redis event: end`)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  #isConnected: boolean = false

  async connect(): Promise<void> {
    try {
      if (!this.#isConnected) {
        this.#isConnected = true

        await this.connection.connect()

        this.logger.debug(`DatabaseConnector established connection`)
      } else {
        this.logger.debug(`DatabaseConnector already connected`)
      }
    } catch (error) {
      this.#isConnected = false

      this.handleBootstrapError(error, 'connect')
    }
  }

  async close(): Promise<void> {
    try {
      if (this.#isConnected) {
        this.#isConnected = false

        await this.connection.close()

        this.logger.debug(`DatabaseConnector closed connection`)
      } else {
        this.logger.debug(`DatabaseConnector already closed`)
      }
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
      error.context['service'] = 'database-connector'
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'database-connector',
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
  private buildOptions(data: RedisDatabaseConfig): RedisDatabaseConnectorOptions {
    return {
      connectionUrl: data.DATABASE_CONNECTION_URL,
    }
  }
}
