import {
  FullMessageModel,
  MessageBody,
  MessageConnection,
  MessageError,
  MessageHeaders,
  MessageKind,
  MessageMethod,
  MessagePayload
} from '../../models/index.js'

export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

export interface MessageRepository {
  create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    kind: MessageKind,
    method: MessageMethod,
    url: string,
    requestHeaders: MessageHeaders,
    requestBody: MessageBody,
    status: number,
    responseHeaders: MessageHeaders,
    responseBody: MessageBody,
    connection: MessageConnection,
    payload: MessagePayload,
    errors: MessageError[],
    score: number,
    ip: string,
    startTime: number,
    finishTime: number
  ): Promise<void>
  read(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
