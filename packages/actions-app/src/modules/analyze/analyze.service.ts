import { DIContainer } from '@famir/common'
import { ConsumeError } from '@famir/consume'
import { FullMessageModel, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { AnalyzeJobData } from '@famir/produce'
import { Storage, STORAGE } from '@famir/storage'
import { ANALYZE_SERVICE } from './analyze.js'

/**
 * Represents an analyze service
 *
 * @category Analyze
 */
export class AnalyzeService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeService>(
      ANALYZE_SERVICE,
      (c) => new AnalyzeService(c.resolve(MESSAGE_REPOSITORY), c.resolve(STORAGE))
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly storage: Storage
  ) {}

  async readMessage(data: AnalyzeJobData): Promise<FullMessageModel> {
    const message = await this.messageRepository.readFull(data.campaignId, data.messageId)

    if (!message) {
      throw new ConsumeError(`Message not found`, {
        code: 'INTERNAL_ERROR',
      })
    }

    return message
  }

  async saveMessage(message: FullMessageModel): Promise<void> {
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
  }
}
