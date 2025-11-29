import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerMiddleware, HttpServerRouter } from '@famir/domain'

export class ImplHttpServerRouter implements HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      () => new ImplHttpServerRouter()
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
