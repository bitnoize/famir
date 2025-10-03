import { BaseWorker } from '../base/index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WebhookWorker extends BaseWorker {}

export const WEBHOOK_WORKER = Symbol('WebhookWorker')
