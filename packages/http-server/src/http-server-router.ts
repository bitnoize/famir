import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerMiddleware,
  HttpServerMiddlewares
} from './http-server.js'

export class HttpServerRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) =>
        new HttpServerRouter(
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
        )
    )
  }

  static resolve(container: DIContainer): HttpServerRouter {
    return container.resolve(HTTP_SERVER_ROUTER)
  }

  protected readonly assets = new Map<string, string>()
  protected readonly middlewares = new Map<string, HttpServerMiddleware>()

  constructor(
    protected readonly logger: Logger,
    assets: HttpServerAssets
  ) {
    assets.forEach(([assetName, asset]) => {
      if (this.assets.has(assetName)) {
        throw new Error(`Duplicate asset: ${assetName}`)
      }

      this.assets.set(assetName, asset)
    })

    this.logger.debug(`HttpServerRouter initialized`)
  }

  #isActive: boolean = false

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

  addMiddleware(middlewareName: string, middleware: HttpServerMiddleware) {
    if (this.isActive) {
      throw new Error(`Router is active`)
    }

    if (this.middlewares.has(middlewareName)) {
      throw new Error(`Middleware already exists: ${middlewareName}`)
    }

    this.middlewares.set(middlewareName, middleware)

    this.logger.debug(`HttpServerRouter add middleware: ${middlewareName}`)
  }

  getMiddlewares(): HttpServerMiddlewares {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    return Array.from(this.middlewares)
  }

  getAsset(name: string): string | undefined {
    return this.assets.get(name)
  }
}
