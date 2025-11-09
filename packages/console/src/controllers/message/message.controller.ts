import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_REGISTRY,
  ReplServerApiCall,
  ReplServerRegistry,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { MESSAGE_SERVICE, MessageService } from '../../services/index.js'
import { BaseController } from '../base/index.js'
import { addSchemas, validateReadMessageModel } from './message.utils.js'

export const MESSAGE_CONTROLLER = Symbol('MessageController')

export class MessageController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageController>(
      MESSAGE_CONTROLLER,
      (c) =>
        new MessageController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRegistry>(REPL_SERVER_REGISTRY),
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
    registry: ReplServerRegistry,
    protected readonly messageService: MessageService
  ) {
    super(validator, logger, 'message')

    validator.addSchemas(addSchemas)

    registry.addApiCall('readMessage', this.readMessageApiCall)

    this.logger.debug(`MessageController initialized`)
  }

  private readonly readMessageApiCall: ReplServerApiCall = async (data) => {
    try {
      validateReadMessageModel(this.assertSchema, data)

      return await this.messageService.read(data)
    } catch (error) {
      this.handleException(error, 'readMessage', data)
    }
  }
}
