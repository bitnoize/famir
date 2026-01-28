import { HttpBody, HttpState } from '../../http-proto.js'
import { HttpStatusWrapper, HttpHeadersWrapper, HttpMethodWrapper, HttpUrlWrapper, HttpBodyWrapper } from '../http-tools/index.js'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export interface HttpServerContext {
  readonly state: HttpState
  readonly middlewares: string[]
  readonly method: HttpMethodWrapper
  readonly url: HttpUrlWrapper
  readonly requestHeaders: HttpHeadersWrapper
  readonly requestBody: HttpBodyWrapper
  readonly responseHeaders: HttpHeadersWrapper
  readonly responseBody: HttpBodyWrapper
  readonly status: HttpStatusWrapper
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
