import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { HttpServerError } from './http-server.error.js'
import { HttpServerMiddleware, HttpServerMiddlewares } from './http-server.js'

export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

export class HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new HttpServerRouter(c.resolve<Logger>(LOGGER))
    )
  }

  static resolve(container: DIContainer): HttpServerRouter {
    return container.resolve(HTTP_SERVER_ROUTER)
  }

  protected readonly middlewares = new Map<string, HttpServerMiddleware>()
  protected readonly assets = new Map<string, string>()

  constructor(protected readonly logger: Logger) {
    this.logger.debug(`HttpServerRouter initialized`)
  }

  #isActive: boolean = false

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

  addMiddleware(name: string, middleware: HttpServerMiddleware) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    if (this.middlewares.has(name)) {
      throw new Error(`Middleware already exists: ${name}`)
    }

    this.middlewares.set(name, middleware)

    this.logger.info(`HttpServerRouter add middleware: ${name}`)
  }

  getMiddlewares(): Readonly<HttpServerMiddlewares> {
    if (!this.isActive) {
      throw new HttpServerError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return Array.from(this.middlewares)
  }

  addAssets(entries: [string, string][]) {
    if (this.isActive) {
      throw new Error(`Router suddenly active`)
    }

    for (const [name, data] of entries) {
      if (this.assets.has(name)) {
        throw new Error(`Asset already exists: ${name}`)
      }

      this.assets.set(name, data)

      this.logger.info(`HttpServerRouter add asset: ${name}`)
    }
  }

  getAsset(name: string): string | undefined {
    if (!this.isActive) {
      throw new HttpServerError(`Router suddenly not active`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return this.assets.get(name)
  }
}
