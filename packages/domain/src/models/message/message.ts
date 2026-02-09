import { HttpError, HttpPayload, HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'

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
    readonly kind: string,
    readonly method: string,
    readonly url: string,
    readonly status: number,
    readonly score: number,
    readonly ip: string,
    readonly startTime: number,
    readonly finishTime: number,
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
    kind: string,
    method: string,
    url: string,
    readonly requestHeaders: HttpHeaders,
    readonly requestBody: HttpBody,
    status: number,
    readonly responseHeaders: HttpHeaders,
    readonly responseBody: HttpBody,
    readonly connection: HttpConnection,
    readonly payload: HttpPayload,
    readonly errors: HttpError[],
    score: number,
    ip: string,
    startTime: number,
    finishTime: number,
    createdAt: Date
  ) {
    super(
      campaignId,
      messageId,
      proxyId,
      targetId,
      sessionId,
      kind,
      method,
      url,
      status,
      score,
      ip,
      startTime,
      finishTime,
      createdAt
    )
  }
}
