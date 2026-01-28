import { DIContainer } from '@famir/common'
import {
  HTTP_SERVER_ROUTER,
  HttpServerMiddleware,
  HttpServerMiddlewares,
  HttpServerRouter,
  Logger,
  LOGGER
} from '@famir/domain'

export class StdHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new StdHttpServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  protected readonly registry = new Map<string, HttpServerMiddleware>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`HttpServerRouter initialized`)
  }

  register(name: string, middleware: HttpServerMiddleware) {
    if (this.registry.has(name)) {
      this.logger.error(`HttpServerRouter middleware allready registered: ${name}`)
    } else {
      this.logger.info(`HttpServerRouter register middleware: ${name}`)

      this.registry.set(name, middleware)
    }
  }

  resolve(): HttpServerMiddlewares {
    return Array.from(this.registry.entries())
  }

  reset() {
    this.registry.clear()
  }
}
