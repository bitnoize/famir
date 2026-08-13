import { DIContainer } from '@famir/common'
import { DatabaseError, MESSAGE_REPOSITORY, MessageRepository } from '@famir/database'
import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'
import { HttpServerError } from '@famir/http-server'
import { ANALYZE_QUEUE, AnalyzeQueue } from '@famir/producer'

/**
 * DI token for the complete service.
 *
 * @category Complete
 */
export const COMPLETE_SERVICE = Symbol('CompleteService')

/**
 * Represents the complete service.
 *
 * @category Complete
 */
export class CompleteService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<CompleteService>(
      COMPLETE_SERVICE,
      (c) =>
        new CompleteService(
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param messageRepository - The message repository instance.
   * @param analyzeQueue - The analyze queue instance.
   */
  constructor(
    protected readonly messageRepository: MessageRepository,
    protected readonly analyzeQueue: AnalyzeQueue
  ) {}

  async createMessage(data: {
    campaignId: string
    messageId: string
    proxyId: string
    targetId: string
    sessionId: string
    type: HttpType
    method: HttpMethod
    url: string
    requestHeaders: HttpHeaders
    requestBody: HttpBody
    status: number
    responseHeaders: HttpHeaders
    responseBody: HttpBody
    connection: HttpConnection
    payload: HttpPayload
    errors: HttpError[]
    analyze: string | null
    startTime: number
    finishTime: number
  }): Promise<void> {
    try {
      if (data.analyze) {
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
          data.analyze,
          data.startTime,
          data.finishTime
        )

        await this.analyzeQueue.addJob(data.analyze, {
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
          throw HttpServerError.serviceUnavailable(`Service unavailable`, null, error)
        }
      }

      throw error
    }
  }
}
