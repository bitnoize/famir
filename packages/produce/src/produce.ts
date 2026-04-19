import { type Redis } from 'ioredis'

/**
 * @category none
 * @internal
 */
export const PRODUCE_CONNECTOR = Symbol('ProduceConnector')

/**
 * Represents a produce connector
 *
 * @category none
 */
export interface ProduceConnector {
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
 * @category none
 */
export type RedisProduceConnection = Redis

/**
 * @category none
 */
export interface BullProduceConfig {
  PRODUCE_CONNECTION_URL: string
  PRODUCE_PREFIX: string
}

/**
 * @category none
 * @internal
 */
export interface RedisProduceConnectorOptions {
  connectionUrl: string
}

/**
 * @category none
 * @internal
 */
export interface BullProduceQueueOptions {
  prefix: string
}
