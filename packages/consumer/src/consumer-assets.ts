import { DIContainer } from '@famir/common'

/**
 * DI token for the consumer assets.
 */
export const CONSUMER_ASSETS = Symbol('ConsumerAssets')

/**
 * Represents the consumer assets.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { CONSUMER_ASSETS, ConsumerAssets } from '@famir/consumer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Define your assets
 * const assets: [string, string][] = [
 *   [
 *     'mail.html',
 *     `<html><body><center>Hey, <%= data.name %></center></body></html>`
 *   ]
 * ]
 *
 * // Register in DI container
 * ConsumerAssets.register(container, assets)
 *
 * // Resolve from DI container
 * const assets = container.resolve<ConsumerAssets>(CONSUMER_ASSETS)
 * ```
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
