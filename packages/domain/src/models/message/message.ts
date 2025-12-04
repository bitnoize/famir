import {
  HttpBody,
  HttpConnection,
  HttpHeaders,
  HttpLog,
  HttpRequestCookies,
  HttpResponseCookies
} from '../../http-proto.js'

export interface MessageModel {
  readonly campaignId: string
  readonly messageId: string
  readonly proxyId: string
  readonly targetId: string
  readonly sessionId: string
  readonly method: string
  readonly url: string
  readonly isStreaming: boolean
  readonly status: number
  readonly score: number
  readonly createdAt: Date
}

export const testMessageModel = <T extends MessageModel>(value: T | null): value is T => {
  return value != null
}

export interface FullMessageModel extends MessageModel {
  readonly logs: HttpLog[]
  readonly requestHeaders: HttpHeaders
  readonly requestCookies: HttpRequestCookies
  readonly requestBody: HttpBody
  readonly responseHeaders: HttpHeaders
  readonly responseCookies: HttpResponseCookies
  readonly responseBody: HttpBody
  readonly clientIp: string
  readonly startTime: number
  readonly finishTime: number
  readonly connection: HttpConnection
}
