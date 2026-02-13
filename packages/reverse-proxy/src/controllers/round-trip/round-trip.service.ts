import { DIContainer, arrayIncludes } from '@famir/common'
import {
  DatabaseError,
  DatabaseErrorCode,
  MESSAGE_REPOSITORY,
  MessageRepository
} from '@famir/database'
import {
  HTTP_CLIENT,
  HttpClient,
  HttpClientSimpleRequest,
  HttpClientSimpleResponse
} from '@famir/http-client'
import { HttpServerError } from '@famir/http-server'
import { ANALYZE_LOG_QUEUE, AnalyzeLogQueue } from '@famir/workflow'
import { CreateMessageData } from './round-trip.js'

export const ROUND_TRIP_SERVICE = Symbol('RoundTripService')

export class RoundTripService {
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
  ) {}

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
      if (error instanceof DatabaseError) {
        const knownErrorCodes: DatabaseErrorCode[] = ['NOT_FOUND']

        if (arrayIncludes(knownErrorCodes, error.code)) {
          throw new HttpServerError(`Create message failed`, {
            cause: error,
            code: 'INTERNAL_ERROR'
          })
        }
      }

      throw error
    }
  }

  async simpleRequest(request: HttpClientSimpleRequest): Promise<HttpClientSimpleResponse> {
    return await this.httpClient.simpleRequest(request)
  }
}
