import { HttpServerMiddleware } from './http-server.js'

export type HttpServerRegistrySteps = Record<string, HttpServerMiddleware[]>

export interface HttpServerRegistry {
  addMiddleware(stepName: string, middleware: HttpServerMiddleware): void
  getMiddlewares(): HttpServerMiddleware[]
}

export const HTTP_SERVER_REGISTRY = Symbol('HttpServerRegistry')
