import { RedisClientType } from 'redis'
import { DatabaseFunctions } from './database.functions.js'

export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')
export const DATABASE_MANAGER = Symbol('DatabaseManager')

/**
 * Database connector contract
 */
export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}

export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>

/**
 * Database manager contract
 */
export interface DatabaseManager {
  loadFunctions(): Promise<void>
  cleanup(): Promise<void>
}

export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const
export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

export interface RedisDatabaseConfig {
  DATABASE_CONNECTION_URL: string
  DATABASE_PREFIX: string
}

export interface RedisDatabaseConnectorOptions {
  connectionUrl: string
}

export interface RedisDatabaseRepositoryOptions {
  prefix: string
}

export const DATABASE_LOCK_TIMEOUT = 5 * 60 * 1000
