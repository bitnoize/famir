import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageData,
  ReplServerError
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const MESSAGE_SERVICE = Symbol('MessageService')

export class MessageService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageService>(
      MESSAGE_SERVICE,
      (c) =>
        new MessageService(
          c.resolve<Logger>(LOGGER),
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY)
        )
    )
  }

  constructor(
    logger: Logger,
    protected readonly messageRepository: MessageRepository
  ) {
    super(logger)

    this.logger.debug(`MessageService initialized`)
  }

  async readMessage(data: ReadMessageData): Promise<MessageModel> {
    const messageModel = await this.messageRepository.readMessage(data)

    if (!messageModel) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return messageModel
  }
}
