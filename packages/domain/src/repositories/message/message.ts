import {
  HttpBody,
  HttpHeaders,
  HttpLog,
  HttpRequestCookies,
  HttpResponseCookies,
  HttpConnection
} from '../../http-proto.js'
import { FullMessageModel, MessageModel } from '../../models/index.js'

export interface CreateMessageData {
  campaignId: string
  proxyId: string
  targetId: string
  sessionId: string
  logs: HttpLog[]
  method: string
  url: string
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
  startTime: number
  finishTime: number
  connection: HttpConnection
}

export interface ReadMessageData {
  campaignId: string
  messageId: string
}

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

export interface MessageRepository {
  createMessage(data: CreateMessageData): Promise<MessageModel>
  readMessage(data: ReadMessageData): Promise<FullMessageModel | null>
}
