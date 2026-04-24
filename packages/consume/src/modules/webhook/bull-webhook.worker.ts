import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { WEBHOOK_QUEUE_NAME } from '@famir/produce'
import { Validator, VALIDATOR } from '@famir/validator'
import { ConsumeRouter } from '../../consume-router.js'
import {
  BullConsumeConfig,
  CONSUME_CONNECTOR,
  CONSUME_ROUTER,
  ConsumeConnector,
} from '../../consume.js'
import { BullBaseWorker } from '../base/index.js'
import { WEBHOOK_WORKER, WebhookWorker } from './webhook.js'

/**
 * Bull webhook worker implementation
 *
 * @category Webhook
 */
export class BullWebhookWorker extends BullBaseWorker implements WebhookWorker {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<WebhookWorker>(
      WEBHOOK_WORKER,
      (c) =>
        new BullWebhookWorker(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(CONSUME_CONNECTOR),
          c.resolve(CONSUME_ROUTER)
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<BullConsumeConfig>,
    logger: Logger,
    connector: ConsumeConnector,
    router: ConsumeRouter
  ) {
    super(validator, config, logger, connector, router, WEBHOOK_QUEUE_NAME)

    this.logger.debug(`WebhookWorker initialized`)
  }
}
