import { DIContainer } from '@famir/common'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { ReplServerError } from '@famir/repl-server'

/**
 * DI token for the message service.
 *
 * @category Message
 */
export const MESSAGE_SERVICE = Symbol('MessageService')

/**
 * Represents the message service.
 *
 * @category Message
 */
export class MessageService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageService>(
      MESSAGE_SERVICE,
      (c) => new MessageService(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param messageRepository - The message repository instance.
   */
  constructor(protected readonly messageRepository: MessageRepository) {}

  /**
   * Reads the message by its ID.
   */
  async read(data: { campaignId: string; messageId: string }): Promise<FullMessageModel> {
    const message = await this.messageRepository.readFull(data.campaignId, data.messageId)

    if (!message) {
      throw ReplServerError.notFound(`Message not found`)
    }

    return message
  }
}
