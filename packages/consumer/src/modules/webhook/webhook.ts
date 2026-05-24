import { BaseWorker } from '../base/index.js'

/**
 * DI token for a webhook worker implementation.
 *
 * @category Webhook
 */
export const WEBHOOK_WORKER = Symbol('WebhookWorker')

/**
 * Defines the public contract for a webhook worker.
 *
 * @category Webhook
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WebhookWorker extends BaseWorker {}
