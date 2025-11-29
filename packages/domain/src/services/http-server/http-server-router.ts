import { HttpServerMiddleware } from './http-server.js'

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

export interface HttpServerRouter {
  addMiddleware(middleware: HttpServerMiddleware): void
  getMiddlewares(): HttpServerMiddleware[]
}
