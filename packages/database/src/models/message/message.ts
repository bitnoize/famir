import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType
} from '@famir/common'

/*
 * Message is a captured request and response
 */
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
    readonly type: HttpType,
    readonly method: HttpMethod,
    readonly url: string,
    readonly status: number,
    readonly processor: string,
    readonly startTime: number,
    readonly finishTime: number,
    readonly createdAt: Date
  ) {}

  get totalTime(): number {
    return this.finishTime > this.startTime ? this.finishTime - this.startTime : 0
  }
}

/*
 * Extended message
 */
export class FullMessageModel extends MessageModel {
  constructor(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    readonly requestHeaders: HttpHeaders,
    readonly requestBody: HttpBody,
    status: number,
    readonly responseHeaders: HttpHeaders,
    readonly responseBody: HttpBody,
    readonly connection: HttpConnection,
    readonly payload: HttpPayload,
    readonly errors: HttpError[],
    processor: string,
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
      type,
      method,
      url,
      status,
      processor,
      startTime,
      finishTime,
      createdAt
    )
  }
}
