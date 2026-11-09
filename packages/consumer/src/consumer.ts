import { AnalyzeQueueName, ConfigData, WebhookQueueName } from '@famir/domain'
import type { Redis } from 'ioredis'

/**
 * Backend connection for a Redis consumer.
 *
 * @category none
 */
export type RedisConsumerConnection = Redis

/**
 * All consumer queue names type.
 */
export type ConsumerQueueNames = AnalyzeQueueName | WebhookQueueName

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
 * Options for a Bull consumer connector.
 *
 * @category none
 */
export interface RedisConsumerConnectorOptions {
  connectionUrl: string
}

/**
 * Options for a Bull consumer worker.
 *
 * @category none
 */
export interface BullConsumerWorkerOptions extends ConsumerWorkerSettings {
  prefix: string
}

/**
 * Configuration for a Bull consumer.
 *
 * @category none
 */
export interface BullConsumerConfig extends ConfigData {
  /** Redis connection string. */
  CONSUMER_CONNECTION_URL: string
  /** Global prefix for all Redis keys. */
  CONSUMER_PREFIX: string
}
