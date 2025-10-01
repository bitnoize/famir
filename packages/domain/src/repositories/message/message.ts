import {
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies
} from '../../models/index.js'

export interface CreateMessageData {
  campaignId: string
  id: string
  proxyId: string
  targetId: string
  sessionId: string
  clientIp: string
  method: string
  originUrl: string
  forwardUrl: string
  requestHeaders: MessageHeaders
  requestCookies: MessageRequestCookies
  requestBody: Buffer
  statusCode: number
  responseHeaders: MessageHeaders
  responseCookies: MessageResponseCookies
  responseBody: Buffer
  queryTime: number
  score: number
}

export interface ReadMessageData {
  campaignId: string
  id: string
}

export interface MessageRepository {
  create(data: CreateMessageData): Promise<MessageModel>
  read(data: ReadMessageData): Promise<MessageModel | null>
}
