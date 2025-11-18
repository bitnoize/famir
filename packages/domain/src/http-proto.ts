export type HttpLog = [string, Record<string, unknown>]
export type HttpLogs = HttpLog[]

export type HttpHeader = string | string[]

export type HttpHeaders = Record<string, HttpHeader | null | undefined>
export type HttpStrictHeaders = Record<string, HttpHeader>

export type HttpRequestCookie = string

export type HttpRequestCookies = Record<string, HttpRequestCookie | null | undefined>
export type HttpStrictRequestCookies = Record<string, HttpRequestCookie>

export interface HttpResponseCookie {
  value: string | null | undefined
  path?: string | null | undefined
  expires?: number | null | undefined
  maxAge?: number | null | undefined
  domain?: string | null | undefined
  secure?: boolean | null | undefined
  httpOnly?: boolean | null | undefined
  sameSite?: string | null | undefined
}

export type HttpResponseCookies = Record<string, HttpResponseCookie | null | undefined>
export type HttpStrictResponseCookies = Record<string, HttpResponseCookie>

export type HttpBody = Buffer
