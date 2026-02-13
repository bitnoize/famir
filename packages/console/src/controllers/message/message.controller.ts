import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ReadMessageData } from './message.js'
import { messageSchemas } from './message.schemas.js'
import { MESSAGE_SERVICE, type MessageService } from './message.service.js'

export const MESSAGE_CONTROLLER = Symbol('MessageController')

export class MessageController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      MESSAGE_CONTROLLER,
      (c) =>
        new MessageController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<MessageService>(MESSAGE_SERVICE)
        )
    )
  }

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
    this.router.register('readMessage', async (data) => {
      this.validateData<ReadMessageData>('console-read-message-data', data)

      return await this.messageService.read(data)
    })
  }
}
