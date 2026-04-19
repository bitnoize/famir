/**
 * @category Webhook
 * @internal
 */
export const WEBHOOK_WORKER = Symbol('WebhookWorker')

/**
 * Represents a webhook worker
 *
 * @category Webhook
 */
export interface WebhookWorker {
  /**
   * Run worker
   */
  run(): Promise<void>

  /**
   * Close worker
   */
  close(): Promise<void>
}
