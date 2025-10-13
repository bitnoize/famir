import { DIContainer } from '@famir/common'
import {
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageModel,
  ReplServerError
} from '@famir/domain'

export const READ_MESSAGE_USE_CASE = Symbol('ReadMessageUseCase')

export class ReadMessageUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadMessageUseCase>(
      READ_MESSAGE_USE_CASE,
      (c) => new ReadMessageUseCase(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(data: ReadMessageModel): Promise<MessageModel> {
    const message = await this.messageRepository.read(data)

    if (!message) {
      throw new ReplServerError(`Message not found`, {
        code: 'NOT_FOUND'
      })
    }

    return message
  }
}
