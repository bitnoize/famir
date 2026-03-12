import { DIContainer } from '@famir/common'
import { DatabaseError, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import { HttpServerError } from '@famir/http-server'
import { ANALYZE_QUEUE, AnalyzeQueue } from '@famir/workflow'
import { CreateMessageData } from './create-message.js'

export const CREATE_MESSAGE_USE_CASE = Symbol('CreateMessageUseCase')

export class CreateMessageUseCase {
  static inject(container: DIContainer) {
    container.registerSingleton<CreateMessageUseCase>(
      CREATE_MESSAGE_USE_CASE,
      (c) =>
        new CreateMessageUseCase(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE)
        )
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeQueue: AnalyzeQueue
  ) {}

  async execute(data: CreateMessageData): Promise<void> {
    try {
      await this.messageRepository.create(
        data.campaignId,
        data.messageId,
        data.proxyId,
        data.targetId,
        data.sessionId,
        data.kind,
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
        data.score,
        data.ip,
        data.startTime,
        data.finishTime
      )

      await this.analyzeQueue.addJob(data.analyze, {
        campaignId: data.campaignId,
        messageId: data.messageId
      })
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === 'NOT_FOUND') {
          throw new HttpServerError(`Service unavailable`, {
            cause: error,
            context: {
              reason: `Create message failed`
            },
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }

      throw error
    }
  }
}
