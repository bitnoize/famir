import { HttpBody, HttpConnection, HttpHeaders } from '../../http-proto.js'

export interface HttpClientOrdinaryResponse {
  status: number
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  connection: HttpConnection
}

export interface HttpClientStreamingResponse {
  status: number
  responseHeaders: HttpHeaders
  responseBody: ReadableStream
  connection: HttpConnection
}

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  ordinaryRequest(
    proxy: string,
    method: string,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    ordinaryTimeout: number,
    responseBodyLimit: number
  ): Promise<HttpClientOrdinaryResponse>
  /*
  streamingRequest(
    proxy: string,
    method: string,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    connectTimeout: number,
    streamingTimeout: number,
    responseBodyLimit: number
  ): Promise<HttpClientStreamingResponse>
  */
}
