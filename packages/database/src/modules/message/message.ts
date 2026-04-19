import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'
import { FullMessageModel, MessageModel } from './message.models.js'

/**
 * @category Message
 * @internal
 */
export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

/**
 * Represents a message repository
 *
 * @category Message
 */
export interface MessageRepository {
  /**
   * Create message
   */
  create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    status: number,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    connection: HttpConnection,
    payload: HttpPayload,
    errors: HttpError[],
    analyze: string,
    startTime: number,
    finishTime: number
  ): Promise<void>

  /**
   * Create dummy message
   */
  createDummy(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string
  ): Promise<void>

  /**
   * Read message by id
   */
  read(campaignId: string, messageId: string): Promise<MessageModel | null>

  /**
   * Read extended message by id
   */
  readFull(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
