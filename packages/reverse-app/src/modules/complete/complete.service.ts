import { DIContainer } from '@famir/common'
import { DatabaseError, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { ANALYZE_QUEUE, AnalyzeQueue } from '@famir/produce'
import { COMPLETE_SERVICE, CreateMessageData } from './complete.js'

/**
 * Represents a complete service
 *
 * @category Complete
 */
export class CompleteService {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<CompleteService>(
      COMPLETE_SERVICE,
      (c) => new CompleteService(c.resolve(MESSAGE_REPOSITORY), c.resolve(ANALYZE_QUEUE))
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeQueue: AnalyzeQueue
  ) {}

  async createMessage(data: CreateMessageData): Promise<void> {
    try {
      if (data.processor) {
        await this.messageRepository.create(
          data.campaignId,
          data.messageId,
          data.proxyId,
          data.targetId,
          data.sessionId,
          data.type,
          data.method,
          data.url,
          data.requestHeaders,
          data.requestBody,
          data.status,
          data.responseHeaders,
          data.responseBody,
          data.connection,
          data.payload,
          data.errors,
          data.processor,
          data.startTime,
          data.finishTime
        )

        await this.analyzeQueue.addJob(data.processor, {
          campaignId: data.campaignId,
          messageId: data.messageId,
        })
      } else {
        await this.messageRepository.createDummy(
          data.campaignId,
          data.messageId,
          data.proxyId,
          data.targetId,
          data.sessionId
        )
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Service unavailable`, {
            cause: error,
            context: {
              reason: `Create message failed`,
            },
            code: 'SERVICE_UNAVAILABLE',
          })
        }
      }

      throw error
    }
  }
}
