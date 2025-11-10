import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'
import { MessageModel } from '../../models/index.js'

export interface CreateMessageData {
  campaignId: string
  messageId: string
  proxyId: string
  targetId: string
  sessionId: string
  method: string
  originUrl: string
  urlPath: string
  urlQuery: string
  urlHash: string
  requestHeaders: HttpHeaders
  requestCookies: HttpRequestCookies
  requestBody: HttpBody
  status: number
  responseHeaders: HttpHeaders
  responseCookies: HttpResponseCookies
  responseBody: HttpBody
  clientIp: string
  score: number
  queryTime: number
}

export interface ReadMessageData {
  campaignId: string
  messageId: string
}

export interface MessageRepository {
  createMessage(data: CreateMessageData): Promise<string>
  readMessage(data: ReadMessageData): Promise<MessageModel | null>
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')
