import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageModel,
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

  async read(data: ReadMessageModel): Promise<MessageModel> {
    const message = await this.messageRepository.read(data)

    if (!message) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return message
  }
}
