import { HttpBody, HttpConnection, HttpHeaders } from '@famir/http-tools'
import { HttpClientError } from './http-client.error.js'

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  simpleRequest(request: HttpClientSimpleRequest): Promise<HttpClientSimpleResponse>
  streamRequest(request: HttpClientStreamRequest): Promise<HttpClientStreamResponse>
}

export interface HttpClientRequest {
  proxy: string
  method: string
  url: string
  headers: HttpHeaders
  body: HttpBody | ReadableStream
  connectTimeout: number
  timeout: number
  bodyLimit: number
}

export type HttpClientSimpleRequest = HttpClientRequest & { body: HttpBody }
export type HttpClientStreamRequest = HttpClientRequest & { body: ReadableStream }

export interface HttpClientResponse {
  error: HttpClientError | null
  status: number
  headers: HttpHeaders
  body: HttpBody | WritableStream
  connection: HttpConnection
}

export type HttpClientSimpleResponse = HttpClientResponse & { body: HttpBody }
export type HttpClientStreamResponse = HttpClientResponse & { body: ReadableStream }

export interface CurlHttpClientConfig {
  HTTP_CLIENT_VERBOSE: boolean
}

export interface CurlHttpClientOptions {
  verbose: boolean
}
