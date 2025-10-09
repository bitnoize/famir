import {
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies
} from '../../models/index.js'

export interface CreateMessageModel {
  campaignId: string
  messageId: string
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

export interface ReadMessageModel {
  campaignId: string
  messageId: string
}

export interface MessageRepository {
  create(data: CreateMessageModel): Promise<MessageModel>
  read(data: ReadMessageModel): Promise<MessageModel | null>
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')
