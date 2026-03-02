import { DIContainer } from '@famir/common'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { ExecutorError } from '@famir/executor'
import { AnalyzeJobData } from '@famir/workflow'

export const READ_MESSAGE_USE_CASE = Symbol('ReadMessageUseCase')

export class ReadMessageUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<ReadMessageUseCase>(
      READ_MESSAGE_USE_CASE,
      (c) => new ReadMessageUseCase(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {}

  async execute(data: AnalyzeJobData): Promise<FullMessageModel> {
    const message = await this.messageRepository.read(data.campaignId, data.messageId)

    if (!message) {
      throw new ExecutorError(`Message not found`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return message
  }
}
