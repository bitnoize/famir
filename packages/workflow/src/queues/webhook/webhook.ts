export const WEBHOOK_QUEUE_NAME = 'webhook'

export interface WebhookJobData {
  url: string
}

export type WebhookJobResult = boolean

export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

export interface WebhookQueue {
  close(): Promise<void>
  getJobCount(): Promise<number>
  getJobCounts(): Promise<Record<string, number>>
  addJob(data: WebhookJobData): Promise<string>
}
