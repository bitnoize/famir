import { WebhookJobData } from './webhook.job.js'

/**
 * @category Webhook
 * @internal
 */
export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

/**
 * @category Webhook
 * @internal
 */
export const WEBHOOK_QUEUE_NAME = 'webhook'

/**
 * Represents a webhook queue
 *
 * @category Webhook
 */
export interface WebhookQueue {
  /**
   * Close queue
   */
  close(): Promise<void>

  /**
   * Get job cound
   */
  getJobCount(): Promise<number>

  /**
   * Get job counts
   */
  getJobCounts(): Promise<Record<string, number>>

  /**
   * Add job to queue
   */
  addJob(name: string, data: WebhookJobData): Promise<void>
}
