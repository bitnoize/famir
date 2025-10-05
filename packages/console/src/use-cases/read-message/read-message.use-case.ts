import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageModel, MessageRepository, ReadMessageData } from '@famir/domain'

export const READ_MESSAGE_USE_CASE = Symbol('ReadMessageUseCase')

export class ReadMessageUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadMessageUseCase>(
      READ_MESSAGE_USE_CASE,
      (c) => new ReadMessageUseCase(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(data: ReadMessageData): Promise<MessageModel | null> {
    return await this.messageRepository.read(data)
  }
}
