import { HttpBody, HttpHeaders, HttpState } from '../../http-proto.js'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export interface HttpServerContext {
  readonly state: HttpState
  readonly middlewares: string[]
  readonly method: string
  readonly originUrl: string
  readonly url: URL
  readonly requestHeaders: HttpHeaders
  loadRequestBody(bodyLimit: number): Promise<HttpBody>
  readonly responseHeaders: HttpHeaders
  sendResponseBody(status: number, body?: HttpBody): Promise<void>
  readonly status: number
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
