import {
  HttpBody,
  HttpHeader,
  HttpHeaders,
  HttpRequestCookie,
  HttpRequestCookies,
  HttpResponseCookie,
  HttpResponseCookies
} from '../../domain.js'

export type HttpServerContextState = Record<string, unknown>
export type HttpServerContextErrors = unknown[]

export interface HttpServerContext {
  readonly state: HttpServerContextState
  readonly method: string
  isMethod(method: string): boolean
  isMethods(methods: string[]): boolean
  readonly originUrl: string
  urlPath: string
  urlQuery: string
  urlHash: string
  parseUrl(): void
  isStreaming: boolean
  readonly originRequestHeaders: Record<string, HttpHeader | undefined>
  readonly requestHeaders: HttpHeaders
  strictRequestHeaders(): Record<string, HttpHeader>
  setResponseHeaders(headers: Record<string, HttpHeader>): void
  readonly requestCookies: HttpRequestCookies
  parseResponseCookies(): void
  strictRequestCookies(): Record<string, HttpRequestCookie>
  updateRequestCookieHeader(): void
  requestBody: HttpBody
  loadRequestBody(limit: number): Promise<void>
  readonly status: number
  readonly responseHeaders: HttpHeaders
  strictResponseHeaders(): Record<string, HttpHeader>
  readonly responseHeadersSent: boolean
  readonly responseCookies: HttpResponseCookies
  parseResponseCookies(): void
  strictResponseCookies(): Record<string, HttpResponseCookie>
  updateResponseSetCookieHeader(): void
  responseBody: HttpBody
  sendResponse(status: number): Promise<void>
  readonly isComplete: boolean
}

export interface HttpServerContextDump {
  readonly method: string
  readonly originUrl: string
  readonly urlPath: string
  readonly urlQuery: string
  readonly urlHash: string
  readonly requestHeaders: HttpHeaders
  readonly requestCookies: HttpRequestCookies
  readonly requestBody: HttpBody
  readonly status: number
  readonly responseHeaders: HttpHeaders
  readonly responseCookies: HttpResponseCookies
  readonly responseBody: HttpBody
  readonly errors: unknown[]
}
