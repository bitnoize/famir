import { type Redis } from 'ioredis'

/**
 * DI token
 * @category DI
 */
export const CONSUME_CONNECTOR = Symbol('ConsumeConnector')

/**
 * DI token
 * @category DI
 */
export const CONSUME_SPECS = Symbol('ConsumeSpecs')

/**
 * DI token
 * @category DI
 */
export const CONSUME_ASSETS = Symbol('ConsumeAssets')

/**
 * DI token
 * @category DI
 */
export const CONSUME_ROUTER = Symbol('ConsumeRouter')

/**
 * Represents a consume connector
 * @category none
 */
export interface ConsumeConnector {
  /**
   * Get connection object
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T

  /**
   * Connect to Redis
   */
  //connect(): Promise<void>

  /**
   * Close connection
   */
  close(): Promise<void>
}

/**
 * Redis consume connection
 * @category none
 */
export type RedisConsumeConnection = Redis

/**
 * Consume worker processor
 * @category none
 */
export type ConsumeProcessor = (data: unknown) => Promise<unknown>

/**
 * Consume spec
 * @category none
 */
export interface ConsumeSpec {
  readonly concurrency: number
  readonly limiterMax: number
  readonly limiterDuration: number
}

/**
 * @category none
 * @internal
 */
export type ConsumeSpecs = [string, ConsumeSpec][]

/**
 * @category none
 * @internal
 */
export type ConsumeAssets = [string, string][]

/**
 * Bull consume config
 * @category none
 */
export interface BullConsumeConfig {
  CONSUME_CONNECTION_URL: string
  CONSUME_PREFIX: string
}

/**
 * @category none
 * @internal
 */
export interface RedisConsumeConnectorOptions {
  connectionUrl: string
}

/**
 * @category none
 * @internal
 */
export interface BullConsumeWorkerOptions {
  prefix: string
}
