import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CONSUMER_CONNECTOR,
  ConsumerConnector,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR,
  WEBHOOK_QUEUE_NAME,
  WEBHOOK_WORKER,
  WebhookWorker,
} from '@famir/domain'
import { CONSUMER_ROUTER, type ConsumerRouter } from '../../consumer-router.js'
import { ConsumerWorkerSettings } from '../../consumer.js'
import { BullBaseWorker } from '../base/index.js'

/**
 * Bull-based webhook worker implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link ConsumerConnector} via {@link CONSUMER_CONNECTOR} token
 * - {@link ConsumerRouter} via {@link CONSUMER_ROUTER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { BullWebhookWorker } from '@famir/consumer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * BullWebhookWorker.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { WEBHOOK_WORKER, WebhookWorker } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve dependency from container
 * const webhookWorker = container.resolve<WebhookWorker>(WEBHOOK_WORKER)
 *
 * // Run worker
 * await webhookWorker.run()
 *
 * // Close worker
 * await webhookWorker.close()
 * ```
 *
 * @category Webhook
 */
export class BullWebhookWorker extends BullBaseWorker implements WebhookWorker {
  /**
   * Registers the webhook worker as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer, settings?: Partial<ConsumerWorkerSettings>) {
    container.registerSingleton<WebhookWorker>(
      WEBHOOK_WORKER,
      (c) =>
        new BullWebhookWorker(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumerConnector>(CONSUMER_CONNECTOR),
          c.resolve<ConsumerRouter>(CONSUMER_ROUTER),
          settings
        )
    )
  }

  /**
   * Creates a new webhook worker instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   * @param router - The router instance.
   * @param settings - The optional settings object.
   */
  constructor(
    validator: Validator,
    config: Config,
    logger: Logger,
    connector: ConsumerConnector,
    router: ConsumerRouter,
    settings: Partial<ConsumerWorkerSettings> = {}
  ) {
    super(validator, config, logger, connector, router, WEBHOOK_QUEUE_NAME, settings)
  }
}
