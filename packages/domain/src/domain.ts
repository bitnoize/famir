export type HttpHeader = string | string[]
export type HttpHeaders = Record<string, HttpHeader | null | undefined>

export type HttpRequestCookie = string
export type HttpRequestCookies = Record<string, HttpRequestCookie | null | undefined>

export const HTTP_RESPONSE_COOKIE_SAME_SITE = ['strict', 'lax', 'none'] as const
export type HttpResponseCookieSameSite = (typeof HTTP_RESPONSE_COOKIE_SAME_SITE)[number]

export interface HttpResponseCookie {
  value: string | null | undefined
  path?: string | null | undefined
  expires?: number | null | undefined
  maxAge?: number | null | undefined
  domain?: string | null | undefined
  secure?: boolean | null | undefined
  httpOnly?: boolean | null | undefined
  sameSite?: HttpResponseCookieSameSite | null | undefined
}

export type HttpResponseCookies = Record<string, HttpResponseCookie | null | undefined>

export type HttpBody = Buffer

export type HttpDirection = 'request' | 'response'
