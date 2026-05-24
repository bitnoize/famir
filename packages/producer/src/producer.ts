import { ConfigData } from '@famir/config'
import type { Redis } from 'ioredis'

/**
 * Backend connection for a Redis producer.
 *
 * @category none
 */
export type RedisProducerConnection = Redis

/**
 * Configuration for a Bull producer.
 *
 * @category none
 */
export interface BullProducerConfig extends ConfigData {
  /** Redis connection string. */
  PRODUCER_CONNECTION_URL: string
  /** Global prefix for all Redis keys to avoid collisions. */
  PRODUCER_PREFIX: string
}
