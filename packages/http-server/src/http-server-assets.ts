import { DIContainer } from '@famir/common'

/**
 * DI token for the http-server assets.
 */
export const HTTP_SERVER_ASSETS = Symbol('HttpServerAssets')

/**
 * Represents the http-server assets.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { HTTP_SERVER_ASSETS, HttpServerAssets } from '@famir/http-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Define your assets
 * const assets: [string, string][] = [
 *   [
 *     'hello.txt',
 *     'Hi, there!'
 *   ]
 * ]
 *
 * // Register in DI container
 * HttpServerAssets.register(container, assets)
 *
 * // Resolve from DI container
 * const assets = container.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
 *
 * // Retrieve asset by name
 * console.log(assets['hello.txt'])
 * ```
 */
export class HttpServerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<HttpServerAssets>(
      HTTP_SERVER_ASSETS,
      () => new HttpServerAssets(assets)
    )
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS)
  }
}
