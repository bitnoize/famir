/**
 * DI token
 * @category DI
 */
export const WEBHOOK_WORKER = Symbol('WebhookWorker')

/**
 * Represents an webhook worker
 * @category Workers
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
