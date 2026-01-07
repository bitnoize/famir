import { HttpServerContext } from './http-server-context.js'

export type HttpServerNextFunction = () => Promise<void>

export type HttpServerMiddleware = (
  ctx: HttpServerContext,
  next: HttpServerNextFunction
) => Promise<void>

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

export interface HttpServerRouter {
  register(name: string, middleware: HttpServerMiddleware): void
  resolve(): HttpServerMiddleware
}
