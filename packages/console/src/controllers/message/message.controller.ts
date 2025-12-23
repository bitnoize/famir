import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  REPL_SERVER_ROUTER,
  ReplServerApiCall,
  ReplServerError,
  ReplServerRouter,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { ReadMessageData } from './message.js'
import { readMessageDataSchema } from './message.schemas.js'
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

    this.validator.addSchemas({
      'console-read-message-data': readMessageDataSchema
    })

    this.router.addApiCall('readMessage', this.readMessageApiCall)
  }

  private readMessageApiCall: ReplServerApiCall = async (data) => {
    try {
      this.validateReadMessageData(data)

      return await this.messageService.readMessage(data)
    } catch (error) {
      this.handleException(error, 'readMessage', data)
    }
  }

  private validateReadMessageData(value: unknown): asserts value is ReadMessageData {
    try {
      this.validator.assertSchema<ReadMessageData>('console-read-message-data', value)
    } catch (error) {
      throw new ReplServerError(`ReadMessageData validate failed`, {
        cause: error,
        code: 'BAD_REQUEST'
      })
    }
  }
}
