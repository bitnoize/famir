import { HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'

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
  readonly requestHeaders: HttpHeaders
  readonly requestBody: HttpBody
  readonly responseHeaders: HttpHeaders
  readonly responseBody: HttpBody
  readonly clientIp: string
  readonly startTime: number
  readonly finishTime: number
  readonly connection: HttpConnection
}
