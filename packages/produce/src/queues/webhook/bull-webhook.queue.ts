import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { WebhookJobData } from '../../jobs/index.js'
import {
  BullProduceConfig,
  PRODUCE_CONNECTOR,
  ProduceConnector,
  RedisProduceConnection
} from '../../produce.js'
import { BullBaseQueue } from '../base/index.js'
import { WEBHOOK_QUEUE, WEBHOOK_QUEUE_NAME, WebhookQueue } from './webhook.js'

/*
 * Bull webhook queue implementation
 */
export class BullWebhookQueue extends BullBaseQueue implements WebhookQueue {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<WebhookQueue>(
      WEBHOOK_QUEUE,
      (c) =>
        new BullWebhookQueue(
          c.resolve<Config<BullProduceConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ProduceConnector>(PRODUCE_CONNECTOR).getConnection<RedisProduceConnection>()
        )
    )
  }

  constructor(
    config: Config<BullProduceConfig>,
    logger: Logger,
    connection: RedisProduceConnection
  ) {
    super(config, logger, connection, WEBHOOK_QUEUE_NAME)

    this.logger.debug(`WebhookQueue initialized`)
  }

  /*
   * Add job to queue
   */
  async addJob(name: string, data: WebhookJobData): Promise<void> {
    try {
      await this.queue.add(name, data)
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
