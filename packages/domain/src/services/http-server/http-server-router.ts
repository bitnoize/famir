import { HttpServerMiddleware } from './http-server.js'

export type HttpServerRouterSteps = Record<string, HttpServerMiddleware[]>

export interface HttpServerRouter {
  addMiddleware(stepName: string, middleware: HttpServerMiddleware): void
  getMiddlewares(): HttpServerMiddleware[]
}

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')
