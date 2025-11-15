import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'

export interface MessageModel {
  readonly campaignId: string
  readonly messageId: string
  readonly proxyId: string
  readonly targetId: string
  readonly sessionId: string
  readonly method: string
  readonly originUrl: string
  readonly urlPath: string
  readonly urlQuery: string
  readonly urlHash: string
  readonly isStreaming: boolean
  readonly status: number
  readonly score: number
  readonly totalTime: number
  readonly createdAt: Date
}

export interface FullMessageModel extends MessageModel {
  readonly requestHeaders: HttpHeaders
  readonly requestCookies: HttpRequestCookies
  readonly requestBody: HttpBody
  readonly responseHeaders: HttpHeaders
  readonly responseCookies: HttpResponseCookies
  readonly responseBody: HttpBody
  readonly clientIp: string
}
