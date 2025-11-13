import { HttpServerContext } from './http-server-context.js'

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}

export const HTTP_SERVER = Symbol('HttpServer')

export type HttpServerNextFunction = () => Promise<void>

export type HttpServerMiddleware = (
  ctx: HttpServerContext,
  next: HttpServerNextFunction
) => Promise<void>
