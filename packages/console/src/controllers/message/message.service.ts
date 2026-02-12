import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageModel, MessageRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'
import { BaseService } from '../base/index.js'
import { ReadMessageData } from './message.js'

export const MESSAGE_SERVICE = Symbol('MessageService')

export class MessageService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageService>(
      MESSAGE_SERVICE,
      (c) => new MessageService(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {
    super()
  }

  async read(data: ReadMessageData): Promise<MessageModel> {
    const model = await this.messageRepository.read(data.campaignId, data.messageId)

    if (!model) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return model
  }
}
