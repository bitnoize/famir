import { WebhookJobData } from '../../jobs/index.js'

export const WEBHOOK_QUEUE_NAME = 'webhook'

export const WEBHOOK_QUEUE = Symbol('WebhookQueue')

export interface WebhookQueue {
  close(): Promise<void>
  getJobCount(): Promise<number>
  getJobCounts(): Promise<Record<string, number>>
  addJob(data: WebhookJobData): Promise<string>
}
