import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/common'
import { FullMessageModel, MessageModel } from '../../models/index.js'

/**
 * DI token
 * @category DI
 */
export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

/**
 * Represents a message repository
 * @category Repositories
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
    processor: string,
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
