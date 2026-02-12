export const MESSAGE_KINDS = ['ordinary', 'stream-request', 'stream-response'] as const
export type MessageKind = (typeof MESSAGE_KINDS)[number]

export const MESSAGE_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type MessageMethod = (typeof MESSAGE_METHODS)[number]

export type MessageHeader = string | string[]
export type MessageHeaders = Record<string, MessageHeader | undefined>
export type MessageBody = Buffer
export type MessageConnection = Record<string, number | string | null | undefined>
export type MessagePayload = Record<string, unknown>
export type MessageError = readonly [object, ...string[]]

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
    readonly requestHeaders: MessageHeaders,
    readonly requestBody: MessageBody,
    status: number,
    readonly responseHeaders: MessageHeaders,
    readonly responseBody: MessageBody,
    readonly connection: MessageConnection,
    readonly payload: MessagePayload,
    readonly errors: MessageError[],
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
