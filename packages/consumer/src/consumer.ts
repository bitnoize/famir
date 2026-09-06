import { ConfigData } from '@famir/domain'
import type { Redis } from 'ioredis'

/**
 * Backend connection for a Redis consumer.
 *
 * @category none
 */
export type RedisConsumerConnection = Redis

/**
 * Settings for a consumer worker.
 *
 * @category none
 */
export interface ConsumerWorkerSettings {
  /** Maximum number of jobs to process concurrently. */
  concurrency: number
  /** Maximum number of jobs to process within the duration window. */
  limiterMax: number
  /** Time window in milliseconds for the rate limiter. */
  limiterDuration: number
}

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
