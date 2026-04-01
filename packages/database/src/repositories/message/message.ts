import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType
} from '@famir/common'
import { FullMessageModel, MessageModel } from '../../models/index.js'

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

/**
 * Message repository contract
 */
export interface MessageRepository {
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
  createDummy(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string
  ): Promise<void>
  read(campaignId: string, messageId: string): Promise<MessageModel | null>
  readFull(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
