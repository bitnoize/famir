import { BaseQueue } from '../base/index.js'
import { WebhookJobData } from './webhook.job.js'

/**
 * DI token for a webhook queue implementation.
 *
 * @category Webhook Queue
 */
export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

/**
 * Webhook queue name.
 *
 * @category Webhook Queue
 */
export const WEBHOOK_QUEUE_NAME = 'webhook'

/**
 * Webhook queue name type.
 *
 * @category Webhook Queue
 */
export type WebhookQueueName = typeof WEBHOOK_QUEUE_NAME

/**
 * Defines the public contract for a webhook queue.
 *
 * @category Webhook Queue
 */
export interface WebhookQueue extends BaseQueue {
  /**
   * Adds a new job to the webhook queue.
   *
   * @param name - The name of the job to be added.
   * @param data - The arbitrary data to append to the job.
   * @throws ProducerError If adding job fails.
   */
  addJob(name: string, data: WebhookJobData): Promise<void>
}
