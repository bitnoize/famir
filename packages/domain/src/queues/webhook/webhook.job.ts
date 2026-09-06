/**
 * Data payload for a webhook job.
 *
 * @category Webhook Queue
 */
export interface WebhookJobData {
  url: string
}

/**
 * Result of a webhook job.
 *
 * @category Webhook Queue
 */
export type WebhookJobResult = boolean
