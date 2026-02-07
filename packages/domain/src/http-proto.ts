export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export interface HttpUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

export type HttpHeader = string | string[]

export type HttpHeaders = Record<string, HttpHeader | undefined>
export type HttpStrictHeaders = Record<string, HttpHeader>

export interface HttpContentType {
  type: string
  parameters: Record<string, string>
}

export type HttpCookie = string
export type HttpCookies = Record<string, HttpCookie | undefined>

export interface HttpSetCookie {
  value: string
  expires?: number
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: string
}
export type HttpSetCookies = Record<string, HttpSetCookie | undefined>

export type HttpBody = Buffer

export type HttpText = string

export type HttpJson = NonNullable<unknown>

export type HttpQueryString = Record<string, unknown>
export interface HttpParseQueryStringOptions {
  // ...
}
export interface HttpFormatQueryStringOptions {
  // ..
}

export type HttpConnection = Record<string, number | string | null | undefined>

export type HttpPayload = Record<string, unknown>

export type HttpError = [unknown, ...string[]]
export type HttpErrors = HttpError[]
