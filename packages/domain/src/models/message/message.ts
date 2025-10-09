export type MessageHeader = string | string[]
export type MessageHeaders = Record<string, MessageHeader | null | undefined>

export type MessageRequestCookie = string
export type MessageRequestCookies = Record<string, MessageRequestCookie | null | undefined>

export interface MessageResponseCookie {
  name: string // FIXME
  value: string
  path?: string | null | undefined
  domain?: string | null | undefined
  expires?: number | null | undefined
  maxAge?: number | null | undefined
  secure?: boolean | null | undefined
  httpOnly?: boolean | null | undefined
  sameSite?: string | null | undefined
}
export type MessageResponseCookies = Record<string, MessageResponseCookie | null | undefined>

export interface MessageModel {
  readonly campaignId: string
  readonly messageId: string
  readonly proxyId: string
  readonly targetId: string
  readonly sessionId: string
  readonly clientIp: string
  readonly method: string
  readonly originUrl: string
  readonly forwardUrl: string
  readonly requestHeaders: MessageHeaders
  readonly requestCookies: MessageRequestCookies
  readonly requestBody: Buffer
  readonly statusCode: number
  readonly responseHeaders: MessageHeaders
  readonly responseCookies: MessageResponseCookies
  readonly responseBody: Buffer
  readonly queryTime: number
  readonly score: number
  readonly createdAt: Date
}

export type MessageHeadersDirection = 'requestHeaders' | 'responseHeaders'
export type MessageBodyDirection = 'requestBody' | 'responseBody'
