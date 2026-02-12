import {
  HttpBodyWrap,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap
} from '@famir/http-tools'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export type HttpServerContextState = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpServerContextState
  readonly middlewares: string[]
  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap
  loadRequest(bodyLimit: number): Promise<void>
  sendResponse(): Promise<void>
  readonly isBot: boolean
  readonly ip: string
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

export interface StdHttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_ERROR_PAGE: string
}

export interface StdHttpServerOptions {
  address: string
  port: number
  errorPage: string
}
