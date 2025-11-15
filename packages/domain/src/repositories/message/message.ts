import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'
import { FullMessageModel, MessageModel } from '../../models/index.js'

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
  isStreaming: boolean
  requestHeaders: HttpHeaders
  requestCookies: HttpRequestCookies
  requestBody: HttpBody
  responseHeaders: HttpHeaders
  responseCookies: HttpResponseCookies
  responseBody: HttpBody
  clientIp: string
  status: number
  score: number
  totalTime: number
}

export interface ReadMessageData {
  campaignId: string
  messageId: string
}

export interface MessageRepository {
  createMessage(data: CreateMessageData): Promise<MessageModel>
  readMessage(data: ReadMessageData): Promise<FullMessageModel | null>
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')
