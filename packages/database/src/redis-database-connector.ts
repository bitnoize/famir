import { DIContainer, LifecycleError, serializeError } from '@famir/common'
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

  /** Connect in-flight promise. */
  private connectPromise: Promise<void> | null = null

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

    const conf = this.config.get<RedisDatabaseConfig>('database-config')
    this.options = this.buildOptions(conf)

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
      this.logger.debug(`DatabaseConnector Redis event: ready`)
    })

    this.connection.on('end', () => {
      this.logger.debug(`DatabaseConnector Redis event: end`)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T {
    return this.connection as T
  }

  #isShutdown: boolean = false

  #isConnected: boolean = false

  async connect(): Promise<void> {
    if (this.#isShutdown) {
      this.logger.debug(`DatabaseConnector shutdown, skip connect`)

      return
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = this.performConnect()

    return this.connectPromise
  }

  async close(): Promise<void> {
    try {
      this.#isShutdown = true

      if (this.connectPromise) {
        try {
          await this.connectPromise
        } catch {
          // Ignore connect error
        }
      }

      if (this.#isConnected) {
        await this.connection.close()

        this.#isConnected = false

        this.logger.info(`DatabaseConnector closed connection`)
      } else {
        this.logger.debug(`DatabaseConnector not connected, skip close`)
      }
    } catch (error) {
      this.#isConnected = false

      throw LifecycleError.wrap(error, {
        service: 'database-connector',
        method: 'close',
      })
    }
  }

  /**
   * Actual connection logic.
   */
  private async performConnect(): Promise<void> {
    try {
      if (!this.#isConnected) {
        await this.waitUntilConnectionReady()

        this.#isConnected = true

        this.logger.info(`DatabaseConnector established connection`)
      } else {
        this.logger.debug(`DatabaseConnector already connected`)
      }
    } catch (error) {
      this.#isConnected = false

      throw LifecycleError.wrap(error, {
        service: 'database-connector',
        method: 'connect',
      })
    } finally {
      this.connectPromise = null
    }
  }

  /**
   * Waits for the underlying redis client to become ready.
   */
  private waitUntilConnectionReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false

      const cleanup = () => {
        this.connection.off('ready', onReady)
        this.connection.off('error', onError)
        this.connection.off('end', onEnd)
      }

      const onReady = () => {
        if (settled) return
        settled = true

        cleanup()
        resolve()
      }

      const onError = (error: Error) => {
        if (settled) return
        settled = true

        cleanup()
        reject(LifecycleError.create(`Redis connect failed`, null, error))
      }

      const onEnd = () => {
        if (settled) return
        settled = true

        cleanup()
        reject(LifecycleError.create(`Redis connection ended before ready`))
      }

      this.connection.once('ready', onReady)
      this.connection.once('error', onError)
      this.connection.once('end', onEnd)

      this.connection.connect().catch((error: unknown) => {
        if (settled) return
        settled = true

        cleanup()
        reject(LifecycleError.create(`Redis connect critical error`, null, error))
      })
    })
  }

  /**
   * Converts validated configuration to a connector options.
   */
  private buildOptions(conf: RedisDatabaseConfig): RedisDatabaseConnectorOptions {
    return {
      connectionUrl: conf.DATABASE_CONNECTION_URL,
    }
  }
}
