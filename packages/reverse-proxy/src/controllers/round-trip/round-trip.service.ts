import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientOrdinaryRequest,
  HttpClientOrdinaryResponse
} from '@famir/http-client'
import { ANALYZE_LOG_QUEUE, AnalyzeLogQueue } from '@famir/workflow'
import { BaseService } from '../base/index.js'
import { CreateMessageData } from './round-trip.js'

export const ROUND_TRIP_SERVICE = Symbol('RoundTripService')

export class RoundTripService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<RoundTripService>(
      ROUND_TRIP_SERVICE,
      (c) =>
        new RoundTripService(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<AnalyzeLogQueue>(ANALYZE_LOG_QUEUE),
          c.resolve<HttpClient>(HTTP_CLIENT)
        )
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeLogQueue: AnalyzeLogQueue,
    protected readonly httpClient: HttpClient
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

  async ordinaryRequest(request: HttpClientOrdinaryRequest): Promise<HttpClientOrdinaryResponse> {
    return await this.httpClient.ordinaryRequest(request)
  }
}
