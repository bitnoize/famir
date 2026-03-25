import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageModel, MessageRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { MESSAGE_SERVICE, ReadMessageData } from './message.js'

export class MessageService {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageService>(
      MESSAGE_SERVICE,
      (c) => new MessageService(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {}

  async read(data: ReadMessageData): Promise<MessageModel> {
    const message = await this.messageRepository.read(data.campaignId, data.messageId)

    if (!message) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return message
  }
}
