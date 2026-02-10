import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  MESSAGE_REPOSITORY,
  MessageRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'
import { CreateMessageData } from './completion.js'

export const COMPLETION_SERVICE = Symbol('CompletionService')

export class CompletionService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<CompletionService>(
      COMPLETION_SERVICE,
      (c) =>
        new CompletionService(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE)
        )
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeLogQueue: AnalyzeLogQueue
  ) {
    super()
  }

  async createMessage(data: CreateMessageData): Promise<void> {
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
    } catch (error) {
      this.simpleDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }
}
