import { DIContainer } from '@famir/common'
import {
  ANALYZE_LOG_QUEUE,
  AnalyzeLogJobData,
  AnalyzeLogQueue,
  CreateMessageData,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository
} from '@famir/domain'
import { BaseService } from '../base/index.js'

export const COMPLETE_SERVICE = Symbol('CompleteService')

export class CompleteService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteService>(
      COMPLETE_SERVICE,
      (c) =>
        new CompleteService(
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

  async createMessage(data: CreateMessageData): Promise<{
    message: MessageModel
    jobId: string
  }> {
    try {
      const message = await this.messageRepository.createMessage(data)

      const jobData: AnalyzeLogJobData = {
        campaignId: message.campaignId,
        messageId: message.messageId
      }

      const jobId = await this.analyzeLogQueue.addJob(jobData, 'default')

      return {
        message,
        jobId
      }
    } catch (error) {
      this.filterDatabaseException(error, [])
    }
  }
}
