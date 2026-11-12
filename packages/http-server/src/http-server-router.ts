import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/domain'
import { HttpServerMiddleware } from './http-server-middleware.js'

/**
 * DI token for the http-server router.
 */
export const HTTP_SERVER_ROUTER = Symbol('HttpServerRouter')

type ReplServerRouterMiddlewareChain = [string, HttpServerMiddleware][]

/**
 * Represents the http-server router.
 *
 * The router acts as root of HTTP server and handles the routing of requests
 * through a middleware chain.
 */
export class HttpServerRouter {
  /**
   * Registers the router as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<HttpServerRouter>(
      HTTP_SERVER_ROUTER,
      (c) => new this(c.resolve<Logger>(LOGGER))
    )
  }

  /**
   * Resolves the router from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The router instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
  }

  /** Underlying middleware chain. */
  protected readonly middlewareChain: ReplServerRouterMiddlewareChain = []

  /**
   * Creates a new router instance.
   *
   * @param logger - The logger instance.
   */
  constructor(protected readonly logger: Logger) {}

  #isActive: boolean = false

  /**
   * Checks if the router is active.
   *
   * @returns `true` if the router is active, `false` otherwise.
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activates the router, enabling middleware processing.
   *
   * Once activated, middleware can be retrieved but not added.
   *
   * @returns This router for method chaining.
   */
  activate(): this {
    if (!this.#isActive) {
      this.#isActive = true
    }

    return this
  }

  /**
   * Adds a middleware in the chain.
   *
   * Middleware can only be added before the router is activated.
   *
   * @param name - The unique name for the middleware.
   * @param handler - The middleware handler function.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If a middleware with the same name already exists.
   */
  add(name: string, handler: HttpServerMiddleware): this {
    this.sureNotActive()

    if (this.middlewareChain.find(([existName]) => existName === name)) {
      throw new Error(`Middleware already exists: ${name}`)
    }

    this.middlewareChain.push([name, handler])

    this.logger.debug(`HttpServerRouter add middleware: ${name}`)

    return this
  }

  /**
   * Retrieves a middleware by its index.
   *
   * Middleware can only be retrieved after the router is activated.
   *
   * @param idx - The index position of the middleware.
   * @returns The middleware tuple with name and handler, or `undefined` if not found.
   * @throws Error If the router is not active.
   */
  find(idx: number): [string, HttpServerMiddleware] | undefined {
    this.sureIsActive()

    return this.middlewareChain[idx]
  }

  protected sureNotActive() {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }
  }

  protected sureIsActive() {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }
  }
}
