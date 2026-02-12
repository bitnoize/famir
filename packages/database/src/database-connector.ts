import { RedisClientType } from 'redis'
import { DatabaseFunctions } from './database.functions.js'

export const DATABASE_CONNECTOR = Symbol('DatabaseConnector')

export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}

export type RedisDatabaseConnection = RedisClientType<
  Record<string, never>, // Modules
  DatabaseFunctions, // Functions
  Record<string, never>, // Scripts
  3 // RESP version
>
