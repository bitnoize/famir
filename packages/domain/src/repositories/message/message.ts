import {
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies
} from '../../models/index.js'

export interface MessageRepository {
  create(
    campaignId: string,
    id: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    clientIp: string,
    method: string,
    originUrl: string,
    forwardUrl: string,
    requestHeaders: MessageHeaders,
    requestCookies: MessageRequestCookies,
    requestBody: Buffer,
    statusCode: number,
    responseHeaders: MessageHeaders,
    responseCookies: MessageResponseCookies,
    responseBody: Buffer,
    queryTime: number,
    score: number
  ): Promise<MessageModel>

  read(campaignId: string, id: string): Promise<MessageModel | null>
}
