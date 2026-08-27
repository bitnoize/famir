import { DIContainer } from '@famir/common'
import { ConsumerError } from '@famir/consumer'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { Storage, STORAGE } from '@famir/storage'

/**
 * DI token for the analyze service.
 *
 * @category Analyze
 */
export const ANALYZE_SERVICE = Symbol('AnalyzeService')

/**
 * Represents the analyze service.
 *
 * @category Analyze
 */
export class AnalyzeService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeService>(
      ANALYZE_SERVICE,
      (c) =>
        new AnalyzeService(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<Storage>(STORAGE)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param messageRepository - The message repository instance.
   * @param storage - The storage instance.
   */
  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly storage: Storage
  ) {}

  /**
   * Reads a full message from the database.
   *
   * @param data - The job data.
   * @returns The full message model.
   * @throws {@link ConsumerError} If the message is not found.
   */
  async readMessage(data: { campaignId: string; messageId: string }): Promise<FullMessageModel> {
    const message = await this.messageRepository.readFull(data.campaignId, data.messageId)

    if (!message) {
      throw ConsumerError.notFound(`Message not found`)
    }

    return message
  }

  /**
   * Saves a processed message to storage.
   *
   * @param message - The full message model to save.
   * @throws {@link StorageError} If saving to storage fails.
   */
  async saveMessage(message: FullMessageModel): Promise<void> {
    try {
      const basePath = [message.campaignId, message.sessionId, message.messageId].join('/')

      const main = Buffer.from(
        JSON.stringify(
          {
            campaignId: message.campaignId,
            messageId: message.messageId,
            proxyId: message.proxyId,
            targetId: message.targetId,
            sessionId: message.sessionId,
            type: message.type,
            method: message.method,
            url: message.url,
            status: message.status,
            analyze: message.analyze,
            startTime: message.startTime,
            finishTime: message.finishTime,
            totalTime: message.totalTime,
          },
          null,
          2
        )
      )
      await this.storage.putObject(`${basePath}/main.json`, main, {
        'Content-Type': 'application/json',
      })

      const requestHeaders = Buffer.from(JSON.stringify(message.requestHeaders, null, 2))
      await this.storage.putObject(`${basePath}/request-headers.json`, requestHeaders, {
        'Content-Type': 'application/json',
      })

      if (message.requestBody.length > 0) {
        await this.storage.putObject(`${basePath}/request-body.bin`, message.requestBody, {
          'Content-Type': 'application/octet-stream',
        })
      }

      const responseHeaders = Buffer.from(JSON.stringify(message.responseHeaders, null, 2))
      await this.storage.putObject(`${basePath}/response-headers.json`, responseHeaders, {
        'Content-Type': 'application/json',
      })

      if (message.responseBody.length > 0) {
        await this.storage.putObject(`${basePath}/response-body.bin`, message.responseBody, {
          'Content-Type': 'application/octet-stream',
        })
      }

      const connection = Buffer.from(JSON.stringify(message.connection, null, 2))
      await this.storage.putObject(`${basePath}/connection.json`, connection, {
        'Content-Type': 'application/json',
      })

      const payload = Buffer.from(JSON.stringify(message.payload, null, 2))
      await this.storage.putObject(`${basePath}/payload.json`, payload, {
        'Content-Type': 'application/json',
      })

      if (message.errors.length > 0) {
        const errors = Buffer.from(JSON.stringify(message.errors, null, 2))
        await this.storage.putObject(`${basePath}/errors.json`, errors, {
          'Content-Type': 'application/json',
        })
      }
    } catch (error) {
      throw ConsumerError.internalError(`Save message failed`, null, error)
    }
  }
}
