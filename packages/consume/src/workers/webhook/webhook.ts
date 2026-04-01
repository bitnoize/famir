export const WEBHOOK_WORKER = Symbol('WebhookWorker')

/**
 * Webhook worker contract
 */
export interface WebhookWorker {
  run(): Promise<void>
  close(): Promise<void>
}
