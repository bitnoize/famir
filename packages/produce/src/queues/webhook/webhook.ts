import { WebhookJobData } from '../../jobs/index.js'

/**
 * DI token
 * @category DI
 */
export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

/**
 * Queue name
 * @category Queues
 * @internal
 */
export const WEBHOOK_QUEUE_NAME = 'webhook'

/**
 * Represents a webhook queue
 * @category Queues
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
