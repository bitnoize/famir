import {
  HttpBody,
  HttpConnection,
  HttpHeader,
  HttpHeaders,
  HttpLog,
  HttpLogData,
  HttpMediaType,
  HttpQueryString,
  HttpRelativeUrl,
  HttpRequestCookie,
  HttpRequestCookies,
  HttpResponseCookie,
  HttpResponseCookies,
  HttpState
} from '../../http-proto.js'

type AbstractOptions = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpState
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getState<T extends HttpState>(): T
  readonly logs: HttpLog[]
  addLog(name: string, data: HttpLogData): void
  readonly method: string
  isMethod(method: string): boolean
  isMethods(methods: string[]): boolean
  readonly originUrl: string
  readonly url: HttpRelativeUrl
  normalizeUrl(): string
  isUrlPathEquals(path: string): boolean
  isUrlPathUnder(path: string): boolean
  isUrlPathMatch(regExp: RegExp): boolean
  getUrlQuery(options?: AbstractOptions): HttpQueryString | null
  setUrlQuery(query: HttpQueryString, options?: AbstractOptions): void
  isStreaming: boolean
  readonly originHeaders: HttpHeaders
  readonly requestHeaders: HttpHeaders
  getRequestHeader(name: string): string | undefined
  getRequestHeaderArray(name: string): string[] | undefined
  setRequestHeader(name: string, value: HttpHeader | undefined): void
  setRequestHeaders(headers: HttpHeaders): void
  readonly requestCookies: HttpRequestCookies
  getRequestCookie(name: string): HttpRequestCookie | undefined
  setRequestCookie(name: string, cookie: HttpRequestCookie | undefined): void
  setRequestCookies(cookies: HttpRequestCookies): void
  getRequestMediaType(): HttpMediaType | null
  setRequestMediaType(mediaType: HttpMediaType): void
  prepareRequestHeaders(): void
  requestBody: HttpBody
  loadRequestBody(bodyLimit: number): Promise<void>
  applyRequestWrappers(): void
  renewRequestCookieHeader(): void
  readonly responseHeaders: HttpHeaders
  getResponseHeader(name: string): string | undefined
  getResponseHeaderArray(name: string): string[] | undefined
  setResponseHeader(name: string, value: HttpHeader | undefined): void
  setResponseHeaders(headers: HttpHeaders): void
  readonly responseCookies: HttpResponseCookies
  getResponseCookie(name: string): HttpResponseCookie | undefined
  setResponseCookie(name: string, cookie: HttpResponseCookie | undefined): void
  setResponseCookies(cookies: HttpResponseCookies): void
  getResponseMediaType(): HttpMediaType | null
  setResponseMediaType(mediaType: HttpMediaType): void
  responseBody: HttpBody
  prepareResponse(
    status: number,
    headers?: HttpHeaders,
    body?: HttpBody,
    connection?: HttpConnection
  ): void
  applyResponseWrappers(): void
  renewResponseSetCookieHeader(): void
  sendResponse(): Promise<void>
  readonly responseHeadersSent: boolean
  readonly status: number
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
  readonly isComplete: boolean
}
