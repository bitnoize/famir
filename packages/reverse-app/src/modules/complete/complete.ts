import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'

/**
 * @category Complete
 * @internal
 */
export const COMPLETE_CONTROLLER = Symbol('CompleteController')

/**
 * @category Complete
 * @internal
 */
export const COMPLETE_SERVICE = Symbol('CompleteService')

/**
 * @category Complete
 */
export interface CreateMessageData {
  campaignId: string
  messageId: string
  proxyId: string
  targetId: string
  sessionId: string
  type: HttpType
  method: HttpMethod
  url: string
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  status: number
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  connection: HttpConnection
  payload: HttpPayload
  errors: HttpError[]
  processor: string | null
  startTime: number
  finishTime: number
}
