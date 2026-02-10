import { HttpBody, HttpConnection, HttpError, HttpHeaders, HttpPayload } from '../../http-proto.js'
import { FullMessageModel } from '../../models/index.js'

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

export interface MessageRepository {
  create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    kind: string,
    method: string,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    status: number,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    connection: HttpConnection,
    payload: HttpPayload,
    errors: HttpError[],
    score: number,
    ip: string,
    startTime: number,
    finishTime: number
  ): Promise<void>
  read(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
