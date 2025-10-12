export type HttpHeader = string | string[]
export type HttpHeaders = Record<string, HttpHeader>

export type HttpRequestCookie = string
export type HttpRequestCookies = Record<string, HttpRequestCookie>

export interface HttpResponseCookie {
  value: string | undefined
  maxAge?: number | undefined
  expires?: Date | undefined
  httpOnly?: boolean | undefined
  path?: string | undefined
  domain?: string | undefined
  secure?: boolean | undefined
  sameSite?: 'strict' | 'lax' | 'none' | undefined
  //priority?: 'low' | 'medium' | 'high'
  //partitioned?: boolean | undefined
}

export type HttpResponseCookies = Record<string, HttpResponseCookie>

export type HttpBody = Buffer
