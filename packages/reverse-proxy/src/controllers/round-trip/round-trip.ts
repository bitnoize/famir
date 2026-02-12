import {
  MessageBody,
  MessageConnection,
  MessageError,
  MessageHeaders,
  MessageKind,
  MessageMethod,
  MessagePayload
} from '@famir/database'

export interface CreateMessageData {
  campaignId: string
  messageId: string
  proxyId: string
  targetId: string
  sessionId: string
  kind: MessageKind
  method: MessageMethod
  url: string
  requestHeaders: MessageHeaders
  requestBody: MessageBody
  status: number
  responseHeaders: MessageHeaders
  responseBody: MessageBody
  connection: MessageConnection
  payload: MessagePayload
  errors: MessageError[]
  score: number
  ip: string
  startTime: number
  finishTime: number
}
