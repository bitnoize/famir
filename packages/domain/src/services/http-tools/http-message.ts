/*
import { HttpConnection, HttpPayload, HttpErrors } from '../../http-proto.js'
import { HttpMethodWrapper } from './http-method.js'
import { HttpUrlWrapper } from './http-url.js'
import { HttpHeadersWrapper } from './http-headers.js'
import { HttpBodyWrapper } from './http-body.js'
import { HttpStatusWrapper } from './http-status.js'

export class HttpMessage {
  readonly messageId = randomIdent()

  constructor(
    readonly method: HttpMethodWrapper,
    readonly url: HttpUrlWrapper,
    readonly requestHeaders: HttpHeadersWrapper,
    readonly requestBody: HttpBodyWrapper,
    readonly status: HttpStatusWrapper,
    readonly responseHeaders: HttpHeadersWrapper,
    readonly responseBody: HttpBodyWrapper
  ) {}

  readonly connection: HttpConnection = {}
  readonly payload: HttpPayload = {}
  readonly errors: HttpErrors = []
  score: number = 0
}

export interface HttpMessageWrapper {
  freeze(): this
  addRequestHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this
  addRequestBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this
  setRequestFrom(
    url: HttpUrlWrapper,
    headers: HttpHeadersWrapper,
    body?: HttpBodyWrapper
  ): this
  runRequestInterceptors(withBody: boolean): this
  getForwardRequest(): HttpMessageForwardRequest
  addResponseHeadInterceptor(name: string, interceptor: HttpMessageInterceptor): this
  addResponseBodyInterceptor(name: string, interceptor: HttpMessageInterceptor): this
  setResponseFrom(
    status: number,
    headers: HttpStrictHeaders,
    body?: HttpBody,
  ): this
  runResponseInterceptors(withBody: boolean): this
  setResponseTo(
    status: HttpStatusWrapper,
    headers: HttpHeadersWrapper,
    body?: HttpBodyWrapper,
  ): this
  mergeConnection(connection: HttpConnection): this
}

export interface HttpMessageForwardRequest {
  method: HttpMethod
  url: HttpUrl
  headers: HttpHeaders
  body: HttpBody
}

export type HttpMessageInterceptor = (message: HttpMessage) => void
*/
