import { HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'

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
export type HttpClientStreamingRequest = HttpClientRequest & { body: ReadableStream }

export interface HttpClientResponse {
  error: Error | null
  status: number
  headers: HttpHeaders
  body: HttpBody | WritableStream
  connection: HttpConnection
}

export type HttpClientOrdinaryResponse = HttpClientResponse & { body: HttpBody }
export type HttpClientStreamingResponse = HttpClientResponse & { body: ReadableStream }

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  ordinaryRequest(request: HttpClientOrdinaryRequest): Promise<HttpClientOrdinaryResponse>
  streamingRequest(request: HttpClientStreamingRequest): Promise<HttpClientStreamingResponse>
}
