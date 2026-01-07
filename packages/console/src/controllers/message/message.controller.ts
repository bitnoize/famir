import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { ReadMessageData } from './message.js'
import { messageSchemas } from './message.schemas.js'
import { MESSAGE_SERVICE, type MessageService } from './message.service.js'

export const MESSAGE_CONTROLLER = Symbol('MessageController')

export class MessageController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageController>(
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
    return container.resolve<MessageController>(MESSAGE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly messageService: MessageService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(messageSchemas)

    this.router.register('readMessage', this.readMessage)

    this.logger.debug(`MessageController initialized`)
  }

  private readMessage: ReplServerApiCall = async (data) => {
    this.validateData<ReadMessageData>('console-read-message-data', data)

    return await this.messageService.readMessage(data)
  }
}
