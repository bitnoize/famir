import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'
import { MessageModel } from '../../models/index.js'

export interface CreateMessageModel {
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

export interface CreateMessageResult {
  messageId: string
}

export interface ReadMessageModel {
  campaignId: string
  messageId: string
}

export interface MessageRepository {
  create(data: CreateMessageModel): Promise<CreateMessageResult>
  read(data: ReadMessageModel): Promise<MessageModel | null>
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')
