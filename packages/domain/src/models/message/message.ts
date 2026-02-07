import { HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'

export class MessageModel {
  static isNotNull = <T extends MessageModel>(model: T | null): model is T => {
    return model != null
  }

  constructor(
    readonly campaignId: string,
    readonly messageId: string,
    readonly proxyId: string,
    readonly targetId: string,
    readonly sessionId: string,
    readonly method: string,
    readonly url: string,
    readonly isStreaming: boolean,
    readonly status: number,
    readonly score: number,
    readonly createdAt: Date
  ) {}
}

export class FullMessageModel extends MessageModel {
  constructor(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    method: string,
    url: string,
    isStreaming: boolean,
    readonly requestHeaders: HttpHeaders,
    readonly requestBody: HttpBody,
    readonly responseHeaders: HttpHeaders,
    readonly responseBody: HttpBody,
    readonly clientIp: string,
    status: number,
    score: number,
    readonly startTime: number,
    readonly finishTime: number,
    readonly connection: HttpConnection,
    createdAt: Date
  ) {
    super(
      campaignId,
      messageId,
      proxyId,
      targetId,
      sessionId,
      method,
      url,
      isStreaming,
      status,
      score,
      createdAt
    )
  }
}

/*
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
*/
