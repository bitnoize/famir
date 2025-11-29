import { HttpBody, HttpHeaders } from '../../http-proto.js'

export interface HttpClientRequest {
  proxy: string
  method: string
  url: string
  headers: HttpHeaders
  body: HttpBody
  connectTimeout: number
  timeout: number
  bodyLimit: number
}

export interface HttpClientResponse {
  status: number
  headers: HttpHeaders
  body: HttpBody
}

export interface HttpClientStreamingResponse {
  status: number
  headers: HttpHeaders
  // TODO
}

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  forwardRequest(request: HttpClientRequest): Promise<HttpClientResponse>
  //forwardStreamingRequest(request: HttpClientRequest): Promise<HttpClientStreamingResponse>
}
