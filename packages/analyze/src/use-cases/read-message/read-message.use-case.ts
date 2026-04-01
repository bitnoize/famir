import { DIContainer } from '@famir/common'
import { ConsumeError } from '@famir/consume'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { AnalyzeJobData } from '@famir/produce'
import { READ_MESSAGE_USE_CASE } from './read-message.js'

/*
 * Read message use-case
 */
export class ReadMessageUseCase {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReadMessageUseCase>(
      READ_MESSAGE_USE_CASE,
      (c) => new ReadMessageUseCase(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {}

  /*
   * Execute use-case
   */
  async execute(data: AnalyzeJobData): Promise<FullMessageModel> {
    const message = await this.messageRepository.readFull(data.campaignId, data.messageId)

    if (!message) {
      throw new ConsumeError(`Message not found`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return message
  }
}
