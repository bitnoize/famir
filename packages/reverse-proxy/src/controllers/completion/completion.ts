import { HttpBody, HttpConnection, HttpHeaders } from '@famir/domain'

export interface CreateMessageData {
  campaignId: string
  messageId: string
  proxyId: string
  targetId: string
  sessionId: string
  method: string
  url: string
  isStreaming: boolean
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  clientIp: string
  status: number
  score: number
  startTime: number
  finishTime: number
  connection: HttpConnection
}
