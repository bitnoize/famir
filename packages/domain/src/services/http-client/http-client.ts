import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'

export interface HttpClientRequest {
  proxy: string
  method: string
  url: string
  headers: HttpHeaders
  cookies: HttpRequestCookies
  body: HttpBody
  connectTimeout: number
  timeout: number
}

export interface HttpClientResponse {
  status: number
  headers: HttpHeaders
  cookies: HttpResponseCookies
  body: HttpBody
  queryTime: number
  error?: unknown
}

export interface HttpClient {
  query(request: HttpClientRequest): Promise<HttpClientResponse>
}

export const HTTP_CLIENT = Symbol('HttpClient')
