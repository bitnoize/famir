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
  readonly requestHeaders: HttpHeaders
  readonly requestCookies: HttpRequestCookies
  readonly requestBody: HttpBody
  readonly status: number
  readonly responseHeaders: HttpHeaders
  readonly responseCookies: HttpResponseCookies
  readonly responseBody: HttpBody
  readonly clientIp: string
  readonly score: number
  readonly queryTime: number
  readonly createdAt: Date
}
