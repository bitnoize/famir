import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { WEBHOOK_QUEUE_NAME } from '@famir/workflow'
import {
  EXECUTOR_CONNECTOR,
  ExecutorConnector,
  RedisExecutorConnection
} from '../../executor-connector.js'
import { EXECUTOR_ROUTER, ExecutorRouter } from '../../executor-router.js'
import { BullExecutorConfig } from '../../executor.js'
import { BullBaseWorker } from '../base/index.js'
import { WEBHOOK_WORKER, WebhookWorker } from './webhook.js'
import { webhookSchemas } from './webhook.schemas.js'

export class BullWebhookWorker extends BullBaseWorker implements WebhookWorker {
  static inject(container: DIContainer) {
    container.registerSingleton<WebhookWorker>(
      WEBHOOK_WORKER,
      (c) =>
        new BullWebhookWorker(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<BullExecutorConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorConnector>(EXECUTOR_CONNECTOR).connection<RedisExecutorConnection>(),
          c.resolve<ExecutorRouter>(EXECUTOR_ROUTER)
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<BullExecutorConfig>,
    logger: Logger,
    connection: RedisExecutorConnection,
    router: ExecutorRouter
  ) {
    super(validator, config, logger, connection, router, WEBHOOK_QUEUE_NAME)

    this.validator.addSchemas(webhookSchemas)

    this.logger.debug(`WebhookWorker initialized`)
  }
}
