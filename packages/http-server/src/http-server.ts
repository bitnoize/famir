import {
  HttpBodyWrap,
  HttpConnection,
  HttpHeadersWrap,
  HttpMethodWrap,
  HttpStatusWrap,
  HttpUrlWrap
} from '@famir/http-tools'
import type { Readable, Writable } from 'node:stream'

export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export type HttpServerContextState = Record<string, unknown>

export interface HttpServerContext {
  readonly state: HttpServerContextState
  readonly middlewares: string[]
  readonly verbose: boolean
  readonly errorPage: string
  readonly method: HttpMethodWrap
  readonly url: HttpUrlWrap
  readonly requestHeaders: HttpHeadersWrap
  readonly requestBody: HttpBodyWrap
  readonly status: HttpStatusWrap
  readonly responseHeaders: HttpHeadersWrap
  readonly responseBody: HttpBodyWrap
  readonly requestStream: Readable
  readonly responseStream: Writable
  loadRequest(sizeLimit: number): Promise<void>
  sendHead(): void
  sendResponse(): Promise<void>
  readonly isBot: boolean
  readonly ip: string
  readonly connection: HttpConnection
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

export interface NativeHttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_VERBOSE: boolean
  HTTP_SERVER_ERROR_PAGE: string
}

export interface NativeHttpServerOptions {
  address: string
  port: number
  verbose: boolean
  errorPage: string
}
