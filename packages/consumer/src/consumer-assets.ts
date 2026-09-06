import { DIContainer } from '@famir/common'

/**
 * DI token for the consumer assets.
 *
 * @category none
 */
export const CONSUMER_ASSETS = Symbol('ConsumerAssets')

/**
 * Represents the consumer assets.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { ConsumerAssets } from '@famir/consumer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Define your assets
 * const assets: [string, string][] = [
 *   [
 *     'hello.txt',
 *     `Hi, there!`
 *   ]
 * ]
 *
 * // Register in DI container
 * ConsumerAssets.register(container, assets)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { CONSUMER_ASSETS, type ConsumerAssets } from '@famir/consumer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve from DI container
 * const assets = container.resolve<ConsumerAssets>(CONSUMER_ASSETS)
 *
 * // Retrieve asset by name
 * const asset = assets.get('hello.txt')
 * console.log(asset)
 * ```
 *
 * @category none
 */
export class ConsumerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<ConsumerAssets>(CONSUMER_ASSETS, () => new ConsumerAssets(assets))
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ConsumerAssets>(CONSUMER_ASSETS)
  }
}
