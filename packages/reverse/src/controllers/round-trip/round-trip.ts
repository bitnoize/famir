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

export interface SimpleForwardData {
  connectTimeout: number
  timeout: number
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  responseSizeLimit: number
}

export interface StreamRequestForwardData {
  connectTimeout: number
  timeout: number
  proxy: string
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestStream: Readable
  responseSizeLimit: number
}

export type StreamResponseForwardData = SimpleForwardData

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
