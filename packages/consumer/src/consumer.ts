import { ConfigData } from '@famir/config'
import type { Redis } from 'ioredis'

/**
 * Backend connection for a Redis consumer.
 *
 * @category none
 */
export type RedisConsumerConnection = Redis

/**
 * Configuration for a Bull consumer.
 *
 * @category none
 */
export interface BullConsumerConfig extends ConfigData {
  /** Redis connection string. */
  CONSUMER_CONNECTION_URL: string
  /** Global prefix for all Redis keys to avoid collisions. */
  CONSUMER_PREFIX: string
}
