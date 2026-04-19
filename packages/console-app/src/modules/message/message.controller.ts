import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { MESSAGE_CONTROLLER, MESSAGE_SERVICE, ReadMessageData } from './message.js'
import { messageSchemas } from './message.schemas.js'
import { type MessageService } from './message.service.js'

/**
 * Represents a message controller
 *
 * @category Message
 */
export class MessageController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageController>(
      MESSAGE_CONTROLLER,
      (c) =>
        new MessageController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(REPL_SERVER_ROUTER),
          c.resolve(MESSAGE_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): MessageController {
    return container.resolve(MESSAGE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly messageService: MessageService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(messageSchemas)

    this.logger.debug(`MessageController initialized`)
  }

  use() {
    this.router.addApiCall('readMessage', async (data) => {
      this.validateData<ReadMessageData>('console-read-message-data', data)

      return await this.messageService.read(data)
    })
  }
}
