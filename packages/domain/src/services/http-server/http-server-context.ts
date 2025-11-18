import {
  HttpBody,
  HttpHeaders,
  HttpLogs,
  HttpRequestCookies,
  HttpResponseCookies,
  HttpStrictHeaders,
  HttpStrictRequestCookies,
  HttpStrictResponseCookies
} from '../../http-proto.js'

export type HttpServerState = Record<string, unknown>

export interface HttpServerUrl {
  path: string
  query: string
  hash: string
}

export type HttpServerUrlQuery = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpServerState
  readonly logs: HttpLogs
  readonly method: string
  isMethod(method: string): boolean
  isMethods(methods: string[]): boolean
  readonly url: HttpServerUrl
  isUrlPath(path: string): boolean
  parseUrlQuery(): HttpServerUrlQuery
  isStreaming: boolean
  readonly requestHeaders: HttpHeaders
  strictRequestHeaders(): Readonly<HttpStrictHeaders>
  readonly requestCookies: HttpRequestCookies
  strictRequestCookies(): Readonly<HttpStrictRequestCookies>
  requestBody: HttpBody
  loadRequestBody(limit: number): Promise<void>
  readonly responseHeaders: HttpHeaders
  strictResponseHeaders(): Readonly<HttpStrictHeaders>
  readonly responseHeadersSent: boolean
  readonly responseCookies: HttpResponseCookies
  strictResponseCookies(): Readonly<HttpStrictResponseCookies>
  responseBody: HttpBody
  sendResponse(status: number): Promise<void>
  readonly clientIp: string
  readonly status: number
  readonly score: number
  upScore(score: number): void
  startTime: number
  finishTime: number
}
