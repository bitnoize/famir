import {
  MessageBody,
  MessageConnection,
  MessageError,
  MessageHeaders,
  MessageKind,
  MessageMethod,
  MessagePayload
} from '@famir/database'
import { HttpBody, HttpHeaders, HttpMethod } from '@famir/http-tools'
import type { Readable } from 'node:stream'

export interface ForwardBaseData {
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  connectTimeout: number
  timeout: number
  headersSizeLimit: number
}

export interface ForwardSimpleData extends ForwardBaseData {
  requestBody: HttpBody
  bodySizeLimit: number
}

export interface ForwardStreamRequestData extends ForwardBaseData {
  requestStream: Readable
  bodySizeLimit: number
}

export interface ForwardStreamResponseData extends ForwardBaseData {
  requestBody: HttpBody
}

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
