export interface WebhookWorker {
  run(): Promise<void>
  close(): Promise<void>
}

export const WEBHOOK_WORKER = Symbol('WebhookWorker')
