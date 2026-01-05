import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerMiddleware, HttpServerRouter } from '@famir/domain'

export class SimpleHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      () => new SimpleHttpServerRouter()
    )
  }

  protected readonly middlewares: HttpServerMiddleware[] = []

  addMiddleware(middleware: HttpServerMiddleware) {
    this.middlewares.push(middleware)
  }

  getMiddlewares(): HttpServerMiddleware[] {
    return this.middlewares
  }
}
