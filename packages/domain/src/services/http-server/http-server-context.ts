import {
  HttpBody,
  HttpConnection,
  HttpHeader,
  HttpHeaders,
  HttpMediaType,
  HttpQueryString,
  HttpRelativeUrl,
  HttpRequestCookies,
  HttpResponseCookies,
  HttpState
} from '../../http-proto.js'

type AbstractOptions = Record<string, unknown>

/*
export interface HttpServerMessage {
  method: string
  url: string
  isStreaming: boolean
  requestHeaders: HttpHeaders
  requestBody: HttpBody
  responseHeaders: HttpHeaders
  responseBody: HttpBody
  clientIp: string
  status: number
  score: number
  startTime: number
  finishTime: number
  connection: HttpConnection
}
*/

export interface HttpServerContext {
  readonly state: HttpState
  readonly method: string
  isMethod(method: string): boolean
  isMethods(methods: string[]): boolean
  readonly originUrl: string
  readonly url: HttpRelativeUrl
  normalizeUrl(): string
  isUrlPathEquals(path: string): boolean
  isUrlPathUnder(path: string): boolean
  isUrlPathMatch(regExp: RegExp): boolean
  getUrlQuery(options?: AbstractOptions): HttpQueryString
  setUrlQuery(query: HttpQueryString, options?: AbstractOptions): void
  isStreaming: boolean
  readonly requestHeaders: HttpHeaders
  getRequestHeader(name: string): string | undefined
  getRequestHeaderArray(name: string): string[] | undefined
  setRequestHeader(name: string, value: HttpHeader | undefined): void
  setRequestHeaders(headers: HttpHeaders): void
  getRequestMediaType(): HttpMediaType
  setRequestMediaType(mediaType: HttpMediaType): void
  getRequestCookies(): HttpRequestCookies
  setRequestCookies(cookies: HttpRequestCookies): void
  readonly requestBody: HttpBody
  loadRequestBody(bodyLimit: number): Promise<void>
  applyRequestWrappers(): void
  readonly responseHeaders: HttpHeaders
  getResponseHeader(name: string): string | undefined
  getResponseHeaderArray(name: string): string[] | undefined
  setResponseHeader(name: string, value: HttpHeader | undefined): void
  setResponseHeaders(headers: HttpHeaders): void
  getResponseMediaType(): HttpMediaType
  setResponseMediaType(mediaType: HttpMediaType): void
  getResponseCookies(): HttpResponseCookies
  setResponseCookies(cookies: HttpResponseCookies): void
  readonly responseBody: HttpBody
  setResponseBody(body: HttpBody): void
  applyResponseWrappers(): void
  sendResponse(): Promise<void>
  readonly status: number
  setStatus(status: number): void
  readonly isStatusInformation: boolean
  readonly isStatusSuccess: boolean
  readonly isStatusRedirect: boolean
  readonly isStatusClientError: boolean
  readonly isStatusServerError: boolean
  readonly isStatusUnknown: boolean
  readonly score: number
  upScore(score: number): void
  readonly startTime: number
  readonly finishTime: number
  readonly connection: HttpConnection
  //dumpMessage(): HttpServerMessage
  readonly isComplete: boolean
  isBot(): boolean
}
