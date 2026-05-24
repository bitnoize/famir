import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { PRODUCER_CONNECTOR, ProducerConnector } from '../../producer-connector.js'
import { BullBaseQueue } from '../base/index.js'
import { WebhookJobData } from './webhook.job.js'
import { WEBHOOK_QUEUE, WEBHOOK_QUEUE_NAME, WebhookQueue } from './webhook.js'

/**
 * Bull-based webhook queue implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { WEBHOOK_QUEUE, WebhookQueue, BullWebhookQueue } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * BullWebhookQueue.register(container)
 *
 * // Resolve dependency from container
 * const webhookQueue = container.resolve<BullWebhookQueue>(WEBHOOK_QUEUE)
 *
 * // TODO more examples
 * ```
 *
 * @category Webhook
 */
export class BullWebhookQueue extends BullBaseQueue implements WebhookQueue {
  /**
   * Registers the webhook queue as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<WebhookQueue>(
      WEBHOOK_QUEUE,
      (c) =>
        new BullWebhookQueue(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ProducerConnector>(PRODUCER_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new webhook queue instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: ProducerConnector) {
    super(validator, config, logger, connector, WEBHOOK_QUEUE_NAME)
  }

  async addJob(name: string, data: WebhookJobData): Promise<void> {
    try {
      await this.queue.add(name, data)
    } catch (error) {
      this.handleQueueError(error, 'addJob', data)
    }
  }
}
