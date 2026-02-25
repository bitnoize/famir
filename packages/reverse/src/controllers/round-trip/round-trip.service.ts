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
  HttpClientErrorResult,
  HttpClientSimpleResult,
  HttpClientStreamResult
} from '@famir/http-client'
import { HttpServerError } from '@famir/http-server'
import { ANALYZE_QUEUE, AnalyzeJobData, AnalyzeQueue } from '@famir/workflow'
import {
  CreateMessageData,
  SimpleForwardData,
  StreamRequestForwardData,
  StreamResponseForwardData
} from './round-trip.js'

export const ROUND_TRIP_SERVICE = Symbol('RoundTripService')

export class RoundTripService {
  static inject(container: DIContainer) {
    container.registerSingleton<RoundTripService>(
      ROUND_TRIP_SERVICE,
      (c) =>
        new RoundTripService(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE),
          c.resolve<HttpClient>(HTTP_CLIENT)
        )
    )
  }

  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly httpClient: HttpClient
  ) {}

  async simpleForward(
    data: SimpleForwardData
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return await this.httpClient.simpleForward(
      data.connectTimeout,
      data.timeout,
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestBody,
      data.sizeLimit
    )
  }

  async streamRequestForward(
    data: StreamRequestForwardData
  ): Promise<HttpClientSimpleResult | HttpClientErrorResult> {
    return await this.httpClient.streamRequestForward(
      data.connectTimeout,
      data.timeout,
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestStream,
      data.sizeLimit
    )
  }

  async streamResponseForward(
    data: StreamResponseForwardData
  ): Promise<HttpClientStreamResult | HttpClientErrorResult> {
    return await this.httpClient.streamResponseForward(
      data.connectTimeout,
      data.timeout,
      data.proxy,
      data.method,
      data.url,
      data.requestHeaders,
      data.requestBody,
      data.sizeLimit
    )
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

  async addAnalyzeJob(name: string, data: AnalyzeJobData): Promise<void> {
    await this.analyzeQueue.addJob(name, data)
  }
}
