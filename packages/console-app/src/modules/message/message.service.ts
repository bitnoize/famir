import { DIContainer } from '@famir/common'
import {
  DatabaseError,
  FullMessageModel,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReplServerError,
} from '@famir/domain'

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

  /**
   * Deletes the message by its ID.
   */
  async delete(data: { campaignId: string; messageId: string }): Promise<void> {
    try {
      await this.messageRepository.delete(data.campaignId, data.messageId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internalError(`Delete message failed`, null, error)
      }

      throw error
    }
  }

  /**
   * Lists campaign message history.
   */
  async list(data: { campaignId: string; limit: number }): Promise<MessageModel[]> {
    const messages = await this.messageRepository.list(data.campaignId, data.limit)

    if (!messages) {
      throw ReplServerError.notFound(`Campaign not found`)
    }

    return messages
  }

  /**
   * Clears campaign message history.
   */
  async clear(data: { campaignId: string }): Promise<void> {
    try {
      await this.messageRepository.clear(data.campaignId)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.isNotFound) {
          throw ReplServerError.notFound(error.message)
        }

        throw ReplServerError.internalError(`Clear messages failed`, null, error)
      }

      throw error
    }
  }
}
