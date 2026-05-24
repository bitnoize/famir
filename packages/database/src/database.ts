import { ConfigData } from '@famir/config'
import { RedisClientType } from 'redis'
import { DatabaseFunctions } from './database.functions.js'

/**
 * Backend connection for a Redis database.
 *
 * @category none
 */
export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never> // Scripts
>

/**
 * Available status codes for database replies.
 *
 * @category none
 * @internal
 */
export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const

/**
 * Status code for database reply.
 *
 * @category none
 */
export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

/**
 * Configuration for a Redis database.
 *
 * @category none
 */
export interface RedisDatabaseConfig extends ConfigData {
  /** Redis connection string. */
  DATABASE_CONNECTION_URL: string
  /** Global prefix for all Redis keys to avoid collisions. */
  DATABASE_PREFIX: string
}
