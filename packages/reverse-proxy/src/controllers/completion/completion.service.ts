import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogQueue,
  MESSAGE_REPOSITORY,
  MessageModel,
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

  async createMessage(data: CreateMessageData): Promise<MessageModel> {
    try {
      return await this.messageRepository.create(
        data.campaignId,
        data.proxyId,
        data.targetId,
        data.sessionId,
        data.method,
        data.url,
        data.isStreaming,
        data.requestHeaders,
        data.requestBody,
        data.responseHeaders,
        data.responseBody,
        data.clientIp,
        data.status,
        data.score,
        data.startTime,
        data.finishTime,
        data.connection
      )
    } catch (error) {
      this.filterDatabaseException(error, ['NOT_FOUND'])

      throw error
    }
  }
}
