import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { HttpServerMiddleware, HttpServerMiddlewares } from './http-server.js'

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

export class HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new HttpServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly registry = new Map<string, HttpServerMiddleware>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`HttpServerRouter initialized`)
  }

  register(name: string, middleware: HttpServerMiddleware) {
    if (this.registry.has(name)) {
      this.logger.error(`Middleware already registered: ${name}`)
    }

    this.registry.set(name, middleware)

    this.logger.info(`HttpServerRouter register middleware: ${name}`)
  }

  resolve(): HttpServerMiddlewares {
    return Array.from(this.registry.entries())
  }

  reset() {
    this.registry.clear()
  }
}
