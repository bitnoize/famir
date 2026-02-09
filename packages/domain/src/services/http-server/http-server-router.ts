import { HttpServerMiddleware, HttpServerMiddlewares } from './http-server.js'

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

export interface HttpServerRouter {
  register(name: string, middleware: HttpServerMiddleware): this
  resolve(): HttpServerMiddlewares
  reset(): this
}
