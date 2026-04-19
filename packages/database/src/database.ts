import { RedisClientType } from 'redis'
import { DatabaseFunctions } from './database.functions.js'

/**
 * DI token
 * @category DI
 */
export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')

/**
 * DI token
 * @category DI
 */
export const DATABASE_MANAGER = Symbol('DatabaseManager')

/**
 * Represents a database connector
 * @category none
 */
export interface DatabaseConnector {
  /**
   * Get connection object
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Connect to Redis
   */
  connect(): Promise<void>

  /**
   * Close connection
   */
  close(): Promise<void>
}

/**
 * Redis database connection
 * @category none
 */
export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>

/**
 * Represents a database manager
 * @category none
 */
export interface DatabaseManager {
  /**
   * Load database functions
   */
  loadFunctions(): Promise<void>

  /**
   * Cleanup database
   */
  cleanup(): Promise<void>
}

/**
 * @category none
 * @internal
 */
export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

/**
 * Database status code
 * @category none
 */
export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

/**
 * Redis database config
 * @category none
 */
export interface RedisDatabaseConfig {
  DATABASE_CONNECTION_URL: string
  DATABASE_PREFIX: string
}

/**
 * @category none
 * @internal
 */
export interface RedisDatabaseConnectorOptions {
  connectionUrl: string
}

/**
 * @category none
 * @internal
 */
export interface RedisDatabaseRepositoryOptions {
  prefix: string
}

/**
 * @category Utils
 * @internal
 */
export const DATABASE_LOCK_TIMEOUT = 5 * 60 * 1000
