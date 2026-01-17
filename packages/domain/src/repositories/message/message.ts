import { HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'
import { FullMessageModel } from '../../models/index.js'

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

export interface MessageRepository {
  create(
    campaignId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    method: string,
    url: string,
    isStreaming: boolean,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    clientIp: string,
    status: number,
    score: number,
    startTime: number,
    finishTime: number,
    connection: HttpConnection
  ): Promise<string>
  read(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
