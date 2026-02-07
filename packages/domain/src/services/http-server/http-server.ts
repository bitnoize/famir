import {
  HttpBodyWrapper,
  HttpHeadersWrapper,
  HttpMethodWrapper,
  HttpStatusWrapper,
  HttpUrlWrapper
} from '../http-tools/index.js'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export type HttpServerContextState = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpServerContextState
  readonly middlewares: string[]
  readonly method: HttpMethodWrapper
  readonly url: HttpUrlWrapper
  readonly requestHeaders: HttpHeadersWrapper
  readonly requestBody: HttpBodyWrapper
  readonly status: HttpStatusWrapper
  readonly responseHeaders: HttpHeadersWrapper
  readonly responseBody: HttpBodyWrapper
  loadRequest(bodyLimit: number): Promise<void>
  sendResponse(): Promise<void>
  readonly isBot: boolean
  readonly ips: string[]
  readonly ip: string | undefined
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
