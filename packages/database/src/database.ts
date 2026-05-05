import { RedisClientType } from 'redis'
import { DatabaseFunctions } from './database.functions.js'

/**
 * DI token for a database connector.
 *
 * @category none
 * @internal
 */
export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')

/**
 * DI token for a database manager.
 *
 * @category none
 * @internal
 */
export const DATABASE_MANAGER = Symbol('DatabaseManager')

/**
 * Represents a database connector.
 *
 * @category none
 */
export interface DatabaseConnector {
  /**
   * Retrieves the underlying connection object.
   *
   * This method uses a type assertion to return the connection as the requested type.
   * It is the caller's responsibility to ensure the correct type is used.
   *
   * @template T - The expected type of the connection
   * @returns The database connection cast to type `T`
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Establishes the database connection.
   *
   * @returns A promise that resolves when the connection is established
   */
  connect(): Promise<void>

  /**
   * Closes the database connection.
   *
   * @returns A promise that resolves when the connection is closed
   */
  close(): Promise<void>
}

/**
 * Redis database connection.
 *
 * @category none
 */
export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>

/**
 * Represents a database manager.
 *
 * @category none
 */
export interface DatabaseManager {
  /**
   * Loads all custom functions into the database.
   *
   * @returns A promise that resolves once all functions are loaded
   */
  loadFunctions(): Promise<void>

  /**
   * Cleans up the entire database.
   *
   * @returns A promise that resolves once the database is cleared
   */
  cleanup(): Promise<void>
}

/**
 * Available database status codes.
 *
 * @category none
 * @internal
 */
export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

/**
 * Status codes that can be returned by the database.
 *
 * @category none
 */
export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

/**
 * Config for Redis database.
 *
 * @category none
 * @internal
 */
export interface RedisDatabaseConfig {
  DATABASE_CONNECTION_URL: string
  DATABASE_PREFIX: string
}

/**
 * Options for Redis database connector.
 *
 * @category none
 * @internal
 */
export interface RedisDatabaseConnectorOptions {
  connectionUrl: string
}

/**
 * Options for Redis database repository.
 *
 * @category none
 * @internal
 */
export interface RedisDatabaseRepositoryOptions {
  prefix: string
}
