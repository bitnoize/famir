import { HttpBody, HttpConnection, HttpHeaders, HttpMethod } from '@famir/http-tools'
import { Readable } from 'node:stream'
import { HttpClientError } from './http-client.error.js'

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  simpleForward(request: HttpClientSimpleRequest): Promise<HttpClientSimpleResponse>
  streamRequestForward(request: HttpClientStreamRequest): Promise<HttpClientSimpleResponse>
  streamResponseForward(request: HttpClientSimpleRequest): Promise<HttpClientStreamResponse>
}

export interface CurlHttpClientConfig {
  HTTP_CLIENT_VERBOSE: boolean
}

export interface CurlHttpClientOptions {
  verbose: boolean
}

export interface HttpClientBaseRequest {
  readonly proxy: string
  readonly method: HttpMethod
  readonly url: string
  readonly headers: HttpHeaders
  readonly connectTimeout: number
  readonly timeout: number
  readonly bodyLimit: number
}

export interface HttpClientSimpleRequest extends HttpClientBaseRequest {
  readonly body: HttpBody
}

export interface HttpClientStreamRequest extends HttpClientBaseRequest {
  readonly stream: Readable
}

export interface HttpClientResponseFail {
  readonly error: HttpClientError
  readonly connection: HttpConnection
}

export interface HttpClientBaseResponseOk {
  readonly error: null
  readonly status: number
  readonly headers: HttpHeaders
  readonly connection: HttpConnection
}

export interface HttpClientSimpleResponseOk extends HttpClientBaseResponseOk {
  readonly body: HttpBody
}

export type HttpClientSimpleResponse = HttpClientSimpleResponseOk | HttpClientResponseFail

export interface HttpClientStreamResponseOk extends HttpClientBaseResponseOk {
  readonly stream: Readable
}

export type HttpClientStreamResponse = HttpClientStreamResponseOk | HttpClientResponseFail
