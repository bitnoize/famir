import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { BullProduceConfig, PRODUCE_CONNECTOR, ProduceConnector } from '../../produce.js'
import { BullBaseQueue } from '../base/index.js'
import { WebhookJobData } from './webhook.job.js'
import { WEBHOOK_QUEUE, WEBHOOK_QUEUE_NAME, WebhookQueue } from './webhook.js'

/**
 * Bull webhook queue implementation
 *
 * @category Webhook
 */
export class BullWebhookQueue extends BullBaseQueue implements WebhookQueue {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<WebhookQueue>(
      WEBHOOK_QUEUE,
      (c) =>
        new BullWebhookQueue(c.resolve(CONFIG), c.resolve(LOGGER), c.resolve(PRODUCE_CONNECTOR))
    )
  }

  constructor(config: Config<BullProduceConfig>, logger: Logger, connector: ProduceConnector) {
    super(config, logger, connector, WEBHOOK_QUEUE_NAME)

    this.logger.debug(`WebhookQueue initialized`)
  }

  async addJob(name: string, data: WebhookJobData): Promise<void> {
    try {
      await this.queue.add(name, data)
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
