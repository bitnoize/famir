import { HttpBody, HttpConnection, HttpHeaders } from '@famir/http-tools'

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  ordinaryRequest(request: HttpClientOrdinaryRequest): Promise<HttpClientOrdinaryResponse>
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

export type HttpClientOrdinaryRequest = HttpClientRequest & { body: HttpBody }
export type HttpClientStreamRequest = HttpClientRequest & { body: ReadableStream }

export interface HttpClientResponse {
  error: Error | null
  status: number
  headers: HttpHeaders
  body: HttpBody | WritableStream
  connection: HttpConnection
}

export type HttpClientOrdinaryResponse = HttpClientResponse & { body: HttpBody }
export type HttpClientStreamResponse = HttpClientResponse & { body: ReadableStream }

export interface CurlHttpClientConfig {
  HTTP_CLIENT_VERBOSE: boolean
}

export interface CurlHttpClientOptions {
  verbose: boolean
}
