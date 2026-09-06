import { DIContainer } from '@famir/common'
import {
  DATABASE_CONNECTOR,
  DATABASE_MANAGER,
  DatabaseConnector,
  DatabaseError,
  DatabaseManager,
  Logger,
  LOGGER,
} from '@famir/domain'
import { RedisDatabaseConnection } from './database.js'
import { redisFunctions } from './redis-functions.js'

/**
 * Redis-based database manager implementation.
 *
 * Depends:
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { RedisDatabaseManager } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisDatabaseManager.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { DATABASE_MANAGER, DatabaseManager } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve dependency from container
 * const manager = container.resolve<DatabaseManager>(DATABASE_MANAGER)
 *
 * const info = await manager.getInfo()
 * console.log(info)
 *
 * // Load Redis functions
 * await manager.loadFunctions()
 * ```
 *
 * @category none
 */
export class RedisDatabaseManager implements DatabaseManager {
  /**
   * Registers the manager as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<DatabaseManager>(
      DATABASE_MANAGER,
      (c) =>
        new RedisDatabaseManager(
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /** Underlying Redis connection instance. */
  protected readonly connection: RedisDatabaseConnection

  /**
   * Creates a new manager instance.
   *
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(
    protected readonly logger: Logger,
    protected readonly connector: DatabaseConnector
  ) {
    this.connection = connector.getConnection<RedisDatabaseConnection>()
  }

  async getInfo(): Promise<string[]> {
    try {
      const result = await this.connection.INFO('server')

      return result.split('\r\n').filter((res) => {
        return res && !res.startsWith('#')
      })
    } catch (error) {
      throw DatabaseError.wrap(error, {
        method: 'getInfo',
      })
    }
  }

  async loadFunctions(): Promise<void> {
    try {
      await this.connection.FUNCTION_FLUSH()

      const errors: [string, unknown][] = []

      for (const [name, data] of redisFunctions) {
        try {
          this.logger.debug(`Loading Redis functions: ${name}`)

          await this.connection.FUNCTION_LOAD(data)
        } catch (error) {
          errors.push([name, error])
        }
      }

      if (errors.length > 0) {
        await this.connection.FUNCTION_FLUSH()

        throw DatabaseError.internalError(`Loading Redis functions failed`, null, errors)
      } else {
        this.logger.info(`All Redis functions successfully loaded`)
      }
    } catch (error) {
      throw DatabaseError.wrap(error, {
        method: 'loadFunctions',
      })
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.connection.FLUSHDB()

      this.logger.info(`Database cleaned up`)
    } catch (error) {
      throw DatabaseError.wrap(error, {
        method: 'cleanup',
      })
    }
  }
}
