import {
  HttpBody,
  HttpHeaders,
  HttpMethod,
  HttpState,
  HttpUrl,
  HttpUrlQuery
} from '../../http-proto.js'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export interface HttpServerContext {
  readonly state: HttpState
  readonly middlewares: string[]
  readonly method: HttpMethod
  readonly originUrl: string
  readonly url: Readonly<HttpUrl>
  readonly urlQuery: Readonly<HttpUrlQuery>
  readonly requestHeaders: Readonly<HttpHeaders>
  loadRequestBody(bodyLimit: number): Promise<HttpBody>
  readonly responseHeaders: HttpHeaders
  sendResponseBody(status: number, body?: HttpBody): Promise<void>
  readonly status: number
  readonly clientIp: string[]
  readonly startTime: number
  readonly finishTime: number
  readonly isComplete: boolean
}

export type HttpServerNextFunction = () => Promise<void>

export type HttpServerMiddleware = (
  ctx: HttpServerContext,
  next: HttpServerNextFunction
) => Promise<void>

export type HttpServerMiddlewares = [string, HttpServerMiddleware][]
