import { DIContainer } from '@famir/common'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { MESSAGE_SERVICE, ReadMessageData } from './message.js'

/*
 * Message service
 */
export class MessageService {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageService>(
      MESSAGE_SERVICE,
      (c) => new MessageService(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {}

  /*
   * Read message
   */
  async read(data: ReadMessageData): Promise<FullMessageModel> {
    const message = await this.messageRepository.readFull(data.campaignId, data.messageId)

    if (!message) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return message
  }
}
