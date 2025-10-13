import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  MessageModel,
  REPL_SERVER_CONTEXT,
  ReplServerContext,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { BaseController } from '../base/index.js'
import { addSchemas, validateReadMessageModel } from './message.utils.js'
import { READ_MESSAGE_USE_CASE, ReadMessageUseCase } from './use-cases/index.js'

export const MESSAGE_CONTROLLER = Symbol('MessageController')

export class MessageController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageController>(
      MESSAGE_CONTROLLER,
      (c) =>
        new MessageController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerContext>(REPL_SERVER_CONTEXT),
          c.resolve<ReadMessageUseCase>(READ_MESSAGE_USE_CASE)
        )
    )
  }

  static resolve(container: DIContainer): MessageController {
    return container.resolve<MessageController>(MESSAGE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    context: ReplServerContext,
    protected readonly readMessageUseCase: ReadMessageUseCase
  ) {
    super(validator, logger, 'message')

    validator.addSchemas(addSchemas)

    context.setHandler('readMessage', this.readMessageHandler)
  }

  private readonly readMessageHandler = async (data: unknown): Promise<MessageModel> => {
    try {
      validateReadMessageModel(this.assertSchema, data)

      return await this.readMessageUseCase.execute(data)
    } catch (error) {
      this.exceptionWrapper(error, 'readMessage')
    }
  }
}
