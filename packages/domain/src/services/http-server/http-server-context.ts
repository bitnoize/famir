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
  parseRequestHeaders(): void
  strictRequestHeaders(): Record<string, HttpHeader>
  getRequestHeader(name: string): string | undefined
  getRequestHeaderArray(name: string): string[] | undefined
  setRequestHeader(name: string, value: HttpHeader): void
  setRequestHeaders(headers: Record<string, HttpHeader>): void
  delRequestHeader(name: string, prune?: boolean): void
  delRequestHeaders(names: string[], prune?: boolean): void
  parseRequestCookies(): void
  strictRequestCookies(): Record<string, HttpRequestCookie>
  updateRequestCookieHeader(): void
  getRequestCookie(name: string): HttpRequestCookie | undefined
  setRequestCookie(name: string, value: HttpRequestCookie): void
  setRequestCookies(cookies: Record<string, HttpRequestCookie>): void
  delRequestCookie(name: string, prune?: boolean): void
  delRequestCookies(names: string[], prune?: boolean): void
  requestBody: HttpBody
  loadRequestBody(limit: number): Promise<void>
  readonly status: number
  parseResponseHeaders(headers: Record<string, string | string[] | undefined>): void
  strictResponseHeaders(): Record<string, HttpHeader>
  getResponseHeader(name: string): string | undefined
  getResponseHeaderArray(name: string): string[] | undefined
  setResponseHeader(name: string, value: HttpHeader): void
  setResponseHeaders(headers: Record<string, HttpHeader>): void
  delResponseHeader(name: string, prune?: boolean): void
  delResponseHeaders(names: string[], prune?: boolean): void
  readonly responseHeadersSent: boolean
  parseResponseCookies(): void
  strictResponseCookies(): Record<string, HttpResponseCookie>
  updateResponseSetCookieHeader(): void
  getResponseCookie(name: string): HttpResponseCookie | undefined
  setResponseCookie(name: string, value: HttpResponseCookie): void
  setResponseCookies(cookies: Record<string, HttpResponseCookie>): void
  delResponseCookie(name: string, prune?: boolean): void
  delResponseCookies(names: string[], prune?: boolean): void
  responseBody: HttpBody
  sendResponseReply(status: number): Promise<void>
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
