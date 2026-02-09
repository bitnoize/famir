import { HttpBody, HttpConnection, HttpError, HttpHeaders, HttpPayload } from '@famir/domain'

export interface CreateMessageData {
  campaignId: string
  messageId: string
  proxyId: string
  targetId: string
  sessionId: string
  kind: string
  method: string
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  status: number
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  connection: HttpConnection
  payload: HttpPayload
  errors: HttpError[]
  score: number
  ip: string
  startTime: number
  finishTime: number
}
