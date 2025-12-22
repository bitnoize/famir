export const WEBHOOK_WORKER = Symbol('WebhookWorker')

export interface WebhookWorker {
  run(): Promise<void>
  close(): Promise<void>
}
