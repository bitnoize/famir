import { BaseQueue } from '../base/index.js'
import { WebhookJobData } from './webhook.job.js'

/**
 * DI token for a webhook queue implementation.
 *
 * @category Webhook
 */
export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

/**
 * Name of the webhook queue.
 *
 * @category Webhook
 */
export const WEBHOOK_QUEUE_NAME = 'webhook'

/**
 * Defines the public contract for a webhook queue.
 *
 * @category Webhook
 */
export interface WebhookQueue extends BaseQueue {
  /**
   * Adds a new job to the webhook queue.
   *
   * @param name - The name of the job to be added.
   * @param data - The arbitrary data to append to the job.
   * @throws {@link ProducerError} If adding job fails.
   */
  addJob(name: string, data: WebhookJobData): Promise<void>
}
