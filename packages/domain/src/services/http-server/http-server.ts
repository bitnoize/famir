import { HttpBody, HttpHeaders, HttpRequestCookies, HttpResponseCookies } from '../../domain.js'

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export const HTTP_SERVER = Symbol('HttpServer')

export type HttpServerRouteMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'

export interface HttpServerRequest {
  ip: string
  method: string
  url: string
  path: string
  params: Record<string, string>
  headers: HttpHeaders
  cookies: HttpRequestCookies
  body: HttpBody
}

export type HttpServerLocals = Record<string, unknown>

export interface HttpServerResponse {
  status: number
  headers: HttpHeaders
  cookies: HttpResponseCookies
  body: HttpBody
}

export type HttpServerRouteHandler = (
  request: HttpServerRequest,
  locals: HttpServerLocals
) => Promise<HttpServerResponse | undefined>

export type HttpServerRouteHandlerSync = (
  request: HttpServerRequest,
  locals: HttpServerLocals
) => HttpServerResponse | undefined

export interface HttpServerRouter {
  applyTo(express: unknown): void
  setHandler(method: HttpServerRouteMethod, path: string, handler: HttpServerRouteHandler): void
  setHandlerSync(
    method: HttpServerRouteMethod,
    path: string,
    handler: HttpServerRouteHandlerSync
  ): void
}

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')
