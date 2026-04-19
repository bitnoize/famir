import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerMiddleware,
  HttpServerMiddlewares,
} from './http-server.js'

/**
 * Represents a HTTP server router
 * @category none
 */
export class HttpServerRouter {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) =>
        new HttpServerRouter(
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): HttpServerRouter {
    return container.resolve(HTTP_SERVER_ROUTER)
  }

  protected readonly assets: Map<string, string> = new Map()
  protected readonly middlewares: Map<string, HttpServerMiddleware> = new Map()

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

  /**
   * Check if router is active
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activate router
   */
  activate() {
    this.#isActive = true
  }

  /**
   * Add middleware
   */
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

  /**
   * Get middlewares array
   */
  getMiddlewares(): HttpServerMiddlewares {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    return Array.from(this.middlewares)
  }

  /**
   * Get asset by name
   */
  getAsset(name: string): string | undefined {
    return this.assets.get(name)
  }
}
