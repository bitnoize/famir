import { BaseQueue } from '../base/index.js'

export const WEBHOOK_QUEUE_NAME = 'webhook'

export interface WebhookJobData {
  url: string
}

export type WebhookJobResult = boolean

export interface WebhookQueue extends BaseQueue {
  addJob(data: WebhookJobData): Promise<string>
}

export const WEBHOOK_QUEUE = Symbol('WebhookQueue')
