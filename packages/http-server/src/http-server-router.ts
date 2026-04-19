import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  HTTP_SERVER_ASSETS,
  HTTP_SERVER_ROUTER,
  HttpServerAssets,
  HttpServerMiddleware,
  HttpServerMiddlewares,
} from './http-server.js'

type HttpServerMiddlewaresMap = Map<string, HttpServerMiddleware>

/**
 * Represents a HTTP server router
 *
 * @category none
 */
export class HttpServerRouter {
  /**
   * Register dependency
   */
  static register(container: DIContainer, assets: HttpServerAssets) {
    container.registerSingleton<HttpServerAssets>(HTTP_SERVER_ASSETS, () => assets)

    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new HttpServerRouter(c.resolve(LOGGER), c.resolve(HTTP_SERVER_ASSETS))
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): HttpServerRouter {
    return container.resolve(HTTP_SERVER_ROUTER)
  }

  protected readonly middlewares: HttpServerMiddlewaresMap = new Map()

  constructor(
    protected readonly logger: Logger,
    protected readonly assets: HttpServerAssets
  ) {
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
   * Get asset by name
   */
  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
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
   * Get middlewares
   */
  getMiddlewares(): HttpServerMiddlewares {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    return Array.from(this.middlewares)
  }
}
