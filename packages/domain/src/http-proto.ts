export type HttpState = Record<string, unknown>

export type HttpHeader = string | string[]

export type HttpHeaders = Record<string, HttpHeader | undefined>

export type HttpRequestCookie = string

export type HttpRequestCookies = Record<string, HttpRequestCookie | undefined>

export interface HttpResponseCookie {
  value: string
  expires?: number
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: string
}

export type HttpResponseCookies = Record<string, HttpResponseCookie | undefined>

export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

export type HttpBody = Buffer

export interface HttpConnection {
  total_time?: number | null | undefined
  connect_time?: number | null | undefined
  http_version?: number | null | undefined
  // ...
}

export type HttpQueryString = Record<string, unknown>
