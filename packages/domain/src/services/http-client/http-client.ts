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
  error?: unknown
}

export const HTTP_CLIENT = Symbol('HttpClient')

export interface HttpClient {
  forwardRegularRequest(request: HttpClientRequest): Promise<HttpClientResponse>
}
