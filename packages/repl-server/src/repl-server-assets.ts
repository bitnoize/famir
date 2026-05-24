import { DIContainer } from '@famir/common'

/**
 * DI token for the repl-server assets.
 */
export const REPL_SERVER_ASSETS = Symbol('ReplServerAssets')

/**
 * Represents the repl-server assets.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER_ASSETS, ReplServerAssets } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Define your assets
 * const assets: [string, string][] = [
 *   [
 *     'banner-greets.txt',
 *     'Hi, there!'
 *   ]
 * ]
 *
 * // Register in DI container
 * ReplServerAssets.register(container, assets)
 *
 * // Resolve from DI container
 * const assets = container.resolve<ReplServerAssets>(REPL_SERVER_ASSETS)
 * ```
 */
export class ReplServerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<ReplServerAssets>(
      REPL_SERVER_ASSETS,
      () => new ReplServerAssets(assets)
    )
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ReplServerAssets>(REPL_SERVER_ASSETS)
  }
}

/**
 * Default banner greet content.
 *
 * @internal
 */
export const REPL_SERVER_ASSET_BANNER_GREET = `Welcome to Fake-Mirrors!`

/**
 * Default banner leave content.
 *
 * @internal
 */
export const REPL_SERVER_ASSET_BANNER_LEAVE = `So long!`
