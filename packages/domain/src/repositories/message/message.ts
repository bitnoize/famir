import {
  Message,
  MessageHeaders,
  MessageMethod,
  MessageRequestCookies,
  MessageResponseCookies
} from '../../models/index.js'
import { RepositoryContainer } from '../../services/index.js'

export interface MessageRepository {
  create(
    campaignId: string,
    id: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    clientIp: string,
    method: MessageMethod,
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
  ): Promise<RepositoryContainer<Message>>

  read(campaignId: string, id: string): Promise<Message | null>
}
